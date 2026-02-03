import { ObjectId } from 'mongodb';

// User interface for TypeScript type checking
export interface IUser {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  role: 'user' | 'admin';
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User creation interface (for registration)
export interface IUserCreate {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

// User response interface (without sensitive data)
export interface IUserResponse {
  _id: ObjectId;
  name: string;
  email: string;
  isActive: boolean;
  role: 'user' | 'admin';
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Login credentials interface
export interface ILoginCredentials {
  email: string;
  password: string;
}

// JWT payload interface
export interface IJWTPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// User schema validation rules
export const UserSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    trim: true
  },
  email: {
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    required: true,
    minLength: 6,
    maxLength: 128
  },
  role: {
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: 'boolean',
    default: true
  },
  emailVerified: {
    type: 'boolean',
    default: false
  },
  loginAttempts: {
    type: 'number',
    default: 0,
    max: 5
  }
};

// Collection name
export const USER_COLLECTION = 'users';

// User model class with static methods
export class UserModel {
  /**
   * Create a new user document
   */
  static createUser(userData: IUserCreate): Omit<IUser, '_id'> {
    const now = new Date();
    
    return {
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      isActive: true,
      role: userData.role || 'user',
      emailVerified: false,
      loginAttempts: 0,
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Create user response (remove sensitive data)
   */
  static toUserResponse(user: IUser): IUserResponse {
    return {
      _id: user._id!,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      role: user.role,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  /**
   * Check if user account is locked
   */
  static isAccountLocked(user: IUser): boolean {
    return !!(user.lockUntil && user.lockUntil > new Date());
  }

  /**
   * Check if user has exceeded max login attempts
   */
  static hasExceededMaxAttempts(user: IUser): boolean {
    return user.loginAttempts >= 5;
  }

  /**
   * Get account lock duration in minutes
   */
  static getLockDuration(): number {
    return 30; // 30 minutes
  }
}

export default UserModel;