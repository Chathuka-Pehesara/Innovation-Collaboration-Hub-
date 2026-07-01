/**
 * @file        authValidator.ts
 * @owner       Cybersecurity Team
 * @description Authentication Zod schemas with enforced password strength constraints.
 * @depends     None
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
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: strongPassword,
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
    specialization: specializationEnum,
    role: roleEnum.optional().default('student'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: strongPassword,
  }),
});
