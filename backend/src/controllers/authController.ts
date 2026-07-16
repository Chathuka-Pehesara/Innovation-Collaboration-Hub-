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
import axios from 'axios';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';
import { evaluateRisk } from '../security/riskEngine';
import { logLoginActivity } from '../services/loginActivityService';

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
    const sec = req.securityDetails || {
      ip: req.ip || '0.0.0.0',
      userAgent: req.headers['user-agent'] || '',
      browser: 'Unknown',
      os: 'Unknown',
      fingerprint: req.body?.fingerprint || 'none',
    };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      // Log failed attempt
      logLoginActivity({ userId: user.id, security: sec, riskScore: 0, status: 'FAILED' });

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

    // ── Risk Engine Evaluation ─────────────────────────────────────────────────
    const risk = await evaluateRisk({
      userId: user.id,
      fingerprint: sec.fingerprint,
      ip: sec.ip,
      browser: sec.browser,
      os: sec.os,
    });

    console.log(`[SECURITY] Login risk for ${email}: score=${risk.score} decision=${risk.decision}`, risk.reasons);

    if (risk.decision === 'BLOCK') {
      // Log blocked login
      logLoginActivity({ userId: user.id, security: sec, riskScore: risk.score, status: 'BLOCKED' });

      return res.status(403).json({
        message: 'Login blocked due to suspicious activity. Please try from a recognized device.',
        code: 'HIGH_RISK_LOGIN',
        riskScore: risk.score,
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

    // Log successful login with risk score
    logLoginActivity({ userId: user.id, security: sec, riskScore: risk.score, status: 'SUCCESS' });

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
      security: {
        riskScore: risk.score,
        newDevice: risk.score < 90,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /auth/logout ────────────────────────────────────────────────────────

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken || parseCookies(req).refreshToken;

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
    const token = req.cookies?.refreshToken || parseCookies(req).refreshToken;
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

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const parseCookies = (req: Request): Record<string, string> => {
  const list: Record<string, string> = {};
  const rc = req.headers.cookie;

  if (rc) {
    rc.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      list[parts.shift()!.trim()] = decodeURI(parts.join('='));
    });
  }

  return list;
};

// ─── GET /auth/google ────────────────────────────────────────────────────────

export const googleAuthRedirect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client_id = process.env.GOOGLE_CLIENT_ID;
    const redirect_uri = process.env.GOOGLE_REDIRECT_URI;

    if (!client_id || !redirect_uri) {
      return res.status(500).json({ message: 'Google OAuth configuration is missing on the server.' });
    }

    const state = crypto.randomBytes(16).toString('hex');
    res.cookie('oauth_state', state, { httpOnly: true, maxAge: 300000 }); // 5 minutes

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${encodeURIComponent(
      redirect_uri
    )}&response_type=code&scope=openid%20profile%20email&state=${state}`;

    return res.redirect(googleAuthUrl);
  } catch (err) {
    next(err);
  }
};

// ─── GET /auth/google/callback ───────────────────────────────────────────────

export const googleAuthCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, state } = req.query;
    const client_id = process.env.GOOGLE_CLIENT_ID;
    const client_secret = process.env.GOOGLE_CLIENT_SECRET;
    const redirect_uri = process.env.GOOGLE_REDIRECT_URI;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (!code) {
      return res.redirect(`${frontendUrl}/login?error=no_code`);
    }

    const cookies = parseCookies(req);
    const savedState = cookies.oauth_state;
    res.clearCookie('oauth_state');

    if (savedState && state !== savedState) {
      console.warn('Google OAuth State mismatch. Proceeding with caution.');
    }

    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id,
      client_secret,
      code,
      redirect_uri,
      grant_type: 'authorization_code',
    });

    const { access_token } = tokenResponse.data;

    // Retrieve Google profile info
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { email, name, picture } = userResponse.data;

    if (!email) {
      return res.redirect(`${frontendUrl}/login?error=no_email`);
    }

    let user = await prisma.user.findUnique({ where: { email } });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const placeholderPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 12);
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: placeholderPassword,
          role: 'student',
          isVerified: true,
          avatarUrl: picture || null,
          specialization: null, // Set to null to trigger first-time onboard selection
        },
      });
    } else {
      if (!user.isVerified) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { isVerified: true, verificationToken: null },
        });
      }
      if (!user.avatarUrl && picture) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl: picture },
        });
      }
    }

    const localAccessToken = generateAccessToken(user.id, user.role);
    const localRefreshToken = generateRefreshToken(user.id);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.create({
      data: {
        token: localRefreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    res.cookie('refreshToken', localRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    });

    const userPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      specialization: user.specialization || undefined,
      avatarUrl: user.avatarUrl || undefined,
    };

    const redirectUrl = `${frontendUrl}/auth/callback?token=${localAccessToken}&user=${encodeURIComponent(
      JSON.stringify(userPayload)
    )}${isNewUser || !user.specialization ? '&new=true' : ''}`;

    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('Google OAuth Callback Error:', err);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }
};
