/**
 * @file        profileValidator.ts
 * @owner       IT Team
 * @description Zod schemas for validating profile update request bodies.
 * @depends     zod
 */

import { z } from 'zod';

// ─── Update Profile ──────────────────────────────────────────────────────────
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(80).optional(),
  bio: z.string().max(500, 'Bio must not exceed 500 characters.').optional(),
  specialization: z
    .enum(['AI', 'IT', 'Cybersecurity', 'Networking', 'Other'])
    .optional(),
  githubUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  twitterUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
});

// ─── Add Skill ───────────────────────────────────────────────────────────────
export const addSkillSchema = z
  .object({
    skillId: z.string().uuid().optional(),
    skillName: z.string().min(1).max(60).optional(),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
  })
  .refine((data) => data.skillId || data.skillName, {
    message: 'Provide either skillId or skillName.',
  });

// ─── Add Portfolio Item ──────────────────────────────────────────────────────
export const addPortfolioItemSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(100),
  description: z.string().max(500).optional(),
  url: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  imageUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  tags: z.array(z.string().max(30)).max(10).optional().default([]),
});

// ─── Update Availability ─────────────────────────────────────────────────────
export const updateAvailabilitySchema = z.object({
  availableHours: z.number().int().min(0).max(168).optional(),
  availableDays: z
    .array(
      z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    )
    .optional()
    .default([]),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddSkillInput = z.infer<typeof addSkillSchema>;
export type AddPortfolioItemInput = z.infer<typeof addPortfolioItemSchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
