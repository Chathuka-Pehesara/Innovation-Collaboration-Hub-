/**
 * @file        authController.ts
 * @owner       IT Team
 * @description Auth actions mapping registration, credentials checks, and tokens renewals.
 * @depends     backend/src/services/authService.ts
 */

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'change-refresh-secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateAccessToken = (userId: string, role: string) =>
  jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

const generateRefreshToken = (userId: string) =>
  jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d` });

// ─── POST /auth/register ─────────────────────────────────────────────────────

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, specialization, role } = req.body;

    // Check duplicate
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Hash password (bcrypt, 12 salt rounds)
    const hashed = await bcrypt.hash(password, 12);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        specialization,
        role: role || 'student',
        verificationToken,
      },
      select: { id: true, email: true, name: true, specialization: true, role: true },
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationToken);

    return res.status(201).json({
      message: 'Account created. Check your email to verify your address.',
      user,
      verificationUrl: process.env.NODE_ENV !== 'production' || !emailResult.sent ? emailResult.url : undefined,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /auth/login ─────────────────────────────────────────────────────────

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      let token = user.verificationToken;
      if (!token) {
        token = crypto.randomBytes(32).toString('hex');
        await prisma.user.update({
          where: { id: user.id },
          data: { verificationToken: token },
        });
      }
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
      const verifyUrl = `${backendUrl}/api/auth/verify-email/${token}`;

      return res.status(403).json({
        message: 'Please verify your email address before logging in.',
        code: 'EMAIL_NOT_VERIFIED',
        verificationUrl: process.env.NODE_ENV !== 'production' ? verifyUrl : undefined,
      });
    }

    // Issue tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshTokenValue = generateRefreshToken(user.id);

    // Store refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.create({
      data: { token: refreshTokenValue, userId: user.id, expiresAt },
    });

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', refreshTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    });

    return res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        specialization: user.specialization,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /auth/logout ────────────────────────────────────────────────────────

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }

    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
    return res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── POST /auth/refresh ───────────────────────────────────────────────────────

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'No refresh token provided.' });
    }

    // Verify token signature
    let payload: { userId: string };
    try {
      payload = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
    } catch {
      return res.status(401).json({ message: 'Invalid or expired refresh token.' });
    }

    // Check token exists in DB
    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Refresh token has been revoked or expired.' });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    // Issue new access token
    const accessToken = generateAccessToken(user.id, user.role);
    return res.json({ accessToken });
  } catch (err) {
    next(err);
  }
};

// ─── POST /auth/forgot-password ──────────────────────────────────────────────

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond the same way to prevent user enumeration
    const genericResponse = {
      message: 'If an account with that email exists, a reset link has been sent.',
    };

    if (!user) return res.json(genericResponse);

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: { resetPasswordToken: resetToken, resetPasswordExpires: expiresAt },
    });

    const emailResult = await sendPasswordResetEmail(email, resetToken);
    return res.json({
      ...genericResponse,
      resetUrl: process.env.NODE_ENV !== 'production' || !emailResult.sent ? emailResult.url : undefined,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /auth/reset-password ───────────────────────────────────────────────

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    // Invalidate all existing refresh tokens for security
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    return res.json({ message: 'Password reset successfully. Please log in with your new password.' });
  } catch (err) {
    next(err);
  }
};

// ─── GET /auth/verify-email/:token ───────────────────────────────────────────

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const isHtmlRequest = req.headers.accept?.includes('text/html');

    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      if (isHtmlRequest) {
        return res.redirect(`${frontendUrl}/login?error=invalid_verification_token`);
      }
      return res.status(400).json({ message: 'Verification link is invalid or has already been used.' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null },
    });

    if (isHtmlRequest) {
      return res.redirect(`${frontendUrl}/login?verified=true`);
    }

    return res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
};
