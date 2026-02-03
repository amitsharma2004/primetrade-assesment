import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import database from '../../config/database.js';
import { AppError, catchAsync } from '../../middleware/errorHandler.js';
import logger from '../../utils/logger.js';
import { validateRegister, validateLogin, validateChangePassword, validateUpdateProfile } from './auth.validation.js';
import { AuthRequest } from './auth.middleware.js';
import { IUser, UserModel, USER_COLLECTION } from './auth.model.js';

class AuthController {
  /**
   * Register a new user
   */
  register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const { error, value } = validateRegister(req.body);
    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }

    const { name, email, password } = value;

    const db = database.getDb();
    const usersCollection = db.collection(USER_COLLECTION);

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new AppError('User with this email already exists', 409));
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user using model
    const userData = UserModel.createUser({
      name,
      email,
      password: hashedPassword
    });

    const result = await usersCollection.insertOne(userData);

    // Generate JWT token
    const token = this.generateToken({
      id: result.insertedId.toString(),
      email: userData.email,
      role: userData.role
    });

    logger.info('New user registered', {
      userId: result.insertedId,
      email: userData.email,
      timestamp: new Date().toISOString()
    });

    // Create response using model
    const userResponse = UserModel.toUserResponse({
      ...userData,
      _id: result.insertedId
    } as IUser);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token
      }
    });
  });

  /**
   * Login user
   */
  login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const { error, value } = validateLogin(req.body);
    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }

    const { email, password } = value;

    const db = database.getDb();
    const usersCollection = db.collection(USER_COLLECTION);

    // Find user by email
    const user = await usersCollection.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    }) as IUser | null;

    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check if account is locked
    if (UserModel.isAccountLocked(user)) {
      return next(new AppError('Account is temporarily locked due to multiple failed login attempts', 423));
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment login attempts
      const newAttempts = user.loginAttempts + 1;
      const updateData: any = {
        loginAttempts: newAttempts,
        updatedAt: new Date()
      };

      // Lock account if max attempts exceeded
      if (newAttempts >= 5) {
        updateData.lockUntil = new Date(Date.now() + UserModel.getLockDuration() * 60 * 1000);
      }

      await usersCollection.updateOne(
        { _id: user._id },
        { $set: updateData }
      );

      logger.warn('Failed login attempt', {
        email: email.toLowerCase(),
        attempts: newAttempts,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });

      return next(new AppError('Invalid email or password', 401));
    }

    // Reset login attempts on successful login
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          lastLogin: new Date(),
          updatedAt: new Date(),
          loginAttempts: 0
        },
        $unset: { lockUntil: 1 }
      }
    );

    // Generate JWT token
    const token = this.generateToken({
      id: user._id!.toString(),
      email: user.email,
      role: user.role
    });

    logger.info('User logged in successfully', {
      userId: user._id,
      email: user.email,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    // Create response using model
    const userResponse = UserModel.toUserResponse({
      ...user,
      lastLogin: new Date()
    });

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });
  });

  /**
   * Logout user (client-side token removal)
   */
  logout = catchAsync(async (req: AuthRequest, res: Response) => {
    logger.info('User logged out', {
      userId: req.user?.id,
      email: req.user?.email,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      status: 'success',
      message: 'Logout successful'
    });
  });

  /**
   * Get current user profile
   */
  getProfile = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    const db = database.getDb();
    const usersCollection = db.collection(USER_COLLECTION);

    const user = await usersCollection.findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } }
    ) as IUser | null;

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const userResponse = UserModel.toUserResponse(user);

    res.status(200).json({
      status: 'success',
      data: {
        user: userResponse
      }
    });
  });

  /**
   * Generate JWT token
   */
  private generateToken(payload: { id: string; email: string; role: string }): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key';

    return jwt.sign(payload, secret, { expiresIn: '7d' });
  }
}

export default new AuthController();