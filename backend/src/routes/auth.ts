/**
 * @file        auth.ts
 * @owner       IT Team
 * @description Authentication routes with Zod validation middleware.
 * @depends     controllers/authController.ts, middleware/validate.ts, validators/authValidator.ts
 */

import { Router } from 'express';
import {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  verifyEmail,
  googleAuthRedirect,
  googleAuthCallback,
} from '../controllers/authController';
import { validate } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/authValidator';
import {
  loginRateLimiter,
  forgotPasswordRateLimiter,
  registerRateLimiter,
} from '../middleware/rateLimit';

const router = Router();

// POST /auth/register — create account, send verification email
router.post('/register', registerRateLimiter, validate(registerSchema), register);

// POST /auth/login — authenticate, return JWT access + refresh tokens
router.post('/login', loginRateLimiter, validate(loginSchema), login);

// POST /auth/logout — invalidate refresh token cookie
router.post('/logout', logout);

// POST /auth/refresh — issue new access token using HttpOnly refresh token cookie
router.post('/refresh', refresh);

// POST /auth/forgot-password — send password reset link
router.post('/forgot-password', forgotPasswordRateLimiter, validate(forgotPasswordSchema), forgotPassword);

// POST /auth/reset-password — update password with valid token
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// GET /auth/verify-email/:token — verify email address from link
router.get('/verify-email/:token', verifyEmail);

// GET /auth/google — redirect to Google OAuth consent
router.get('/google', googleAuthRedirect);

// GET /auth/google/callback — handle Google OAuth redirect, exchange code, verify identity
router.get('/google/callback', googleAuthCallback);

export default router;
