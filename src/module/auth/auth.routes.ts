import { Router } from 'express';
import authController from './auth.controller.js';
import { authenticate, authRateLimit } from './auth.middleware.js';

const router = Router();

// Public routes
router.post('/register', authRateLimit(5, 15 * 60 * 1000), authController.register);
router.post('/login', authRateLimit(5, 15 * 60 * 1000), authController.login);

// Protected routes
router.use(authenticate);

router.post('/logout', authController.logout);
router.get('/profile', authController.getProfile);

export default router;