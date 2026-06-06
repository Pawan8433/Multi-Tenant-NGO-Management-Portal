import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import * as ctrl from './auth.controller.js';

const router = Router();

// Throttle credential-testing on the sensitive endpoints.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false });

router.post(
  '/register',
  authLimiter,
  [
    body('ngoName').trim().notEmpty().withMessage('NGO name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone').optional({ values: 'falsy' }).trim(),
    body('country').optional({ values: 'falsy' }).trim(),
  ],
  validate,
  ctrl.register
);

router.post(
  '/login',
  authLimiter,
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  ctrl.login
);

router.post('/refresh', [body('refreshToken').notEmpty()], validate, ctrl.refresh);

router.post('/forgot-password', authLimiter, [body('email').isEmail().normalizeEmail()], validate, ctrl.forgotPassword);

router.post(
  '/reset-password',
  authLimiter,
  [body('token').notEmpty(), body('password').isLength({ min: 8 })],
  validate,
  ctrl.resetPassword
);

router.post('/verify-email', [body('token').notEmpty()], validate, ctrl.verifyEmail);

router.get('/me', authenticate, ctrl.me);

export default router;
