/**
 * @file        authValidator.ts
 * @owner       Cybersecurity Team
 * @description Authentication Zod schemas with enforced security constraints and strict input validation.
 */

import { z } from 'zod';

const specializationEnum = z.enum(['IT', 'Cybersecurity', 'AI', 'Networking'], {
  errorMap: () => ({ message: 'Specialization must be IT, Cybersecurity, AI, or Networking' }),
});

const roleEnum = z.enum(['student', 'admin'], {
  errorMap: () => ({ message: 'Role must be student or admin' }),
});

/**
 * Password strength: min 8 chars, at least one uppercase, one number, one special character.
 */
const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password exceeds maximum allowed length')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').max(150, 'Email is too long'),
    password: strongPassword,
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
    specialization: specializationEnum,
    role: roleEnum.optional().default('student'),
  }).strict(), // Reject any unaccounted fields
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').max(150, 'Email exceeds maximum allowed length'),
    password: z.string().min(1, 'Password is required').max(128, 'Password exceeds maximum allowed length'),

    // Security fields logic:
    website: z.string().max(300, 'Honeypot payload too large').optional(), // Honeypot trap
    powNonce: z.string().max(100, 'Invalid PoW Nonce structure').optional(),
    powTimestamp: z.string().max(20, 'Invalid PoW Timestamp').optional(),
  }).strict(), // Reject unknown payloads attempting vulnerability probing
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').max(150, 'Email is too long'),
  }).strict(),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required').max(500, 'Token payload excessive'),
    password: strongPassword,
  }).strict(),
});
