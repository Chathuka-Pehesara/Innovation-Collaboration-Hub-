/**
 * @file        profileController.ts
 * @owner       IT Team
 * @description Profile management controller handling public views, edits, avatar uploads,
 *              skills, portfolio items, availability, and student search.
 * @depends     backend/src/middleware/auth.ts, @prisma/client, cloudinary, multer
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

const prisma = new PrismaClient();

// ─── Cloudinary config (set CLOUDINARY_URL in .env) ────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Multer memory storage (files piped directly to Cloudinary) ─────────────
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed.'));
    }
  },
});

// ─── Shared select for public profile ──────────────────────────────────────
const PUBLIC_PROFILE_SELECT = {
  id: true,
  name: true,
  email: true,
  specialization: true,
  bio: true,
  avatarUrl: true,
  githubUrl: true,
  linkedinUrl: true,
  portfolioUrl: true,
  twitterUrl: true,
  availableHours: true,
  availableDays: true,
  xp: true,
  level: true,
  createdAt: true,
  skills: {
    select: {
      level: true,
      skill: { select: { id: true, name: true } },
    },
  },
  portfolioItems: {
    orderBy: { createdAt: 'desc' as const },
  },
};

// ─── GET /profile/:id ───────────────────────────────────────────────────────
/**
 * Returns the public profile of any student by ID.
 * No authentication required — public endpoint.
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: PUBLIC_PROFILE_SELECT,
    });

    if (!user) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    // Parse JSON-stored fields
    const profile = {
      ...user,
      availableDays: user.availableDays ? JSON.parse(user.availableDays) : [],
      skills: user.skills.map((us) => ({
        id: us.skill.id,
        name: us.skill.name,
        level: us.level,
      })),
      portfolioItems: user.portfolioItems.map((item) => ({
        ...item,
        tags: item.tags ? JSON.parse(item.tags) : [],
      })),
    };

    return res.status(200).json({ profile });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /profile/:id ───────────────────────────────────────────────────────
/**
 * Updates editable profile fields. User can only update their own profile.
 * Admin can update any profile.
 */
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Authorization: own profile or admin
    if (req.user?.userId !== id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own profile.' });
    }

    const {
      name,
      bio,
      specialization,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      twitterUrl,
    } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(specialization !== undefined && { specialization }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(linkedinUrl !== undefined && { linkedinUrl }),
        ...(portfolioUrl !== undefined && { portfolioUrl }),
        ...(twitterUrl !== undefined && { twitterUrl }),
      },
      select: PUBLIC_PROFILE_SELECT,
    });

    return res.status(200).json({
      message: 'Profile updated.',
      profile: {
        ...updated,
        availableDays: updated.availableDays ? JSON.parse(updated.availableDays) : [],
        skills: updated.skills.map((us) => ({
          id: us.skill.id,
          name: us.skill.name,
          level: us.level,
        })),
        portfolioItems: updated.portfolioItems.map((item) => ({
          ...item,
          tags: item.tags ? JSON.parse(item.tags) : [],
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /profile/:id/avatar ───────────────────────────────────────────────
/**
 * Uploads a new avatar image to Cloudinary and saves the URL to the profile.
 * Replaces the previous avatar if one existed.
 */
export const uploadAvatar = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (req.user?.userId !== id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own avatar.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided.' });
    }

    // Upload buffer to Cloudinary
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `innovation-hub/avatars`,
          public_id: `avatar_${id}`,
          overwrite: true,
          transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error('Upload failed.'));
          resolve(result);
        }
      );
      stream.end(req.file!.buffer);
    });

    const updated = await prisma.user.update({
      where: { id },
      data: { avatarUrl: uploadResult.secure_url },
      select: { id: true, avatarUrl: true },
    });

    return res.status(200).json({
      message: 'Avatar updated.',
      avatarUrl: updated.avatarUrl,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /profile/:id/skills ────────────────────────────────────────────────
/**
 * Returns the skills list for a profile. Also consumed by the AI team for matching.
 */
export const getSkills = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const userSkills = await prisma.userSkill.findMany({
      where: { userId: id },
      include: { skill: { select: { id: true, name: true } } },
    });

    const skills = userSkills.map((us) => ({
      id: us.skill.id,
      name: us.skill.name,
      level: us.level,
      userSkillId: us.id,
    }));

    return res.status(200).json({ skills });
  } catch (err) {
    next(err);
  }
};

// ─── GET /profile/:id/badges ────────────────────────────────────────────────
/**
 * Returns the badges earned by a user.
 */
export const getBadges = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const userBadges = await prisma.userBadge.findMany({
      where: { userId: id },
      include: { badge: true },
      orderBy: { awardedAt: 'desc' }
    });

    const badges = userBadges.map((ub) => ({
      id: ub.badge.id,
      name: ub.badge.name,
      description: ub.badge.description,
      tier: ub.badge.tier,
      icon: ub.badge.icon,
      awardedAt: ub.awardedAt,
    }));

    return res.status(200).json({ badges });
  } catch (err) {
    next(err);
  }
};

// ─── POST /profile/:id/skills ───────────────────────────────────────────────
/**
 * Adds a skill (by skillId) to the user's profile with an optional proficiency level.
 * If the skill doesn't exist in the Skill table yet, it is created.
 */
export const addSkill = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (req.user?.userId !== id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own skills.' });
    }

    const { skillId, skillName, level = 'Beginner' } = req.body;

    const VALID_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
    if (!VALID_LEVELS.includes(level)) {
      return res.status(400).json({ message: `Level must be one of: ${VALID_LEVELS.join(', ')}.` });
    }

    // Resolve or create the Skill record
    let skill;
    if (skillId) {
      skill = await prisma.skill.findUnique({ where: { id: skillId } });
      if (!skill) return res.status(404).json({ message: 'Skill not found.' });
    } else if (skillName) {
      skill = await prisma.skill.upsert({
        where: { name: skillName.trim() },
        update: {},
        create: { name: skillName.trim() },
      });
    } else {
      return res.status(400).json({ message: 'Provide either skillId or skillName.' });
    }

    // Upsert the UserSkill join record
    const userSkill = await prisma.userSkill.upsert({
      where: { userId_skillId: { userId: id, skillId: skill.id } },
      update: { level },
      create: { userId: id, skillId: skill.id, level },
      include: { skill: { select: { id: true, name: true } } },
    });

    return res.status(201).json({
      message: 'Skill added.',
      skill: { id: userSkill.skill.id, name: userSkill.skill.name, level: userSkill.level },
    });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /profile/:id/skills/:skillId ────────────────────────────────────
/**
 * Removes a skill from the user's profile.
 */
export const removeSkill = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id, skillId } = req.params;

    if (req.user?.userId !== id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own skills.' });
    }

    const userSkill = await prisma.userSkill.findUnique({
      where: { userId_skillId: { userId: id, skillId } },
    });

    if (!userSkill) {
      return res.status(404).json({ message: 'Skill not found on this profile.' });
    }

    await prisma.userSkill.delete({
      where: { userId_skillId: { userId: id, skillId } },
    });

    return res.status(200).json({ message: 'Skill removed.' });
  } catch (err) {
    next(err);
  }
};

// ─── GET /profile/:id/portfolio ─────────────────────────────────────────────
/**
 * Returns all portfolio items for a profile, ordered by newest first.
 */
export const getPortfolio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const items = await prisma.portfolioItem.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      portfolioItems: items.map((item) => ({
        ...item,
        tags: item.tags ? JSON.parse(item.tags) : [],
      })),
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /profile/:id/portfolio ────────────────────────────────────────────
/**
 * Adds a new portfolio item to the user's profile.
 */
export const addPortfolioItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (req.user?.userId !== id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own portfolio.' });
    }

    const { title, description, url, imageUrl, tags = [] } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: 'Portfolio item title is required.' });
    }

    const item = await prisma.portfolioItem.create({
      data: {
        userId: id,
        title: title.trim(),
        description: description?.trim(),
        url: url?.trim(),
        imageUrl: imageUrl?.trim(),
        tags: JSON.stringify(Array.isArray(tags) ? tags : []),
      },
    });

    return res.status(201).json({
      message: 'Portfolio item added.',
      item: { ...item, tags: JSON.parse(item.tags ?? '[]') },
    });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /profile/:id/portfolio/:itemId ──────────────────────────────────
/**
 * Removes a portfolio item from the user's profile.
 */
export const removePortfolioItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id, itemId } = req.params;

    if (req.user?.userId !== id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own portfolio.' });
    }

    const item = await prisma.portfolioItem.findFirst({
      where: { id: itemId, userId: id },
    });

    if (!item) {
      return res.status(404).json({ message: 'Portfolio item not found.' });
    }

    await prisma.portfolioItem.delete({ where: { id: itemId } });

    return res.status(200).json({ message: 'Portfolio item removed.' });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /profile/:id/portfolio/:itemId ──────────────────────────────────────
/**
 * Updates a portfolio item in the user's profile.
 */
export const updatePortfolioItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id, itemId } = req.params;

    if (req.user?.userId !== id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own portfolio.' });
    }

    const item = await prisma.portfolioItem.findFirst({
      where: { id: itemId, userId: id },
    });

    if (!item) {
      return res.status(404).json({ message: 'Portfolio item not found.' });
    }

    const { title, description, url, imageUrl, tags } = req.body;

    const updated = await prisma.portfolioItem.update({
      where: { id: itemId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(url !== undefined && { url: url?.trim() }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl?.trim() }),
        ...(tags !== undefined && { tags: JSON.stringify(Array.isArray(tags) ? tags : []) }),
      },
    });

    return res.status(200).json({
      message: 'Portfolio item updated.',
      item: { ...updated, tags: JSON.parse(updated.tags ?? '[]') },
    });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /profile/:id/availability ──────────────────────────────────────────
/**
 * Updates the user's weekly availability settings.
 */
export const updateAvailability = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (req.user?.userId !== id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own availability.' });
    }

    const { availableHours, availableDays = [] } = req.body;

    if (availableHours !== undefined && (typeof availableHours !== 'number' || availableHours < 0 || availableHours > 168)) {
      return res.status(400).json({ message: 'availableHours must be a number between 0 and 168.' });
    }

    const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!Array.isArray(availableDays) || availableDays.some((d) => !VALID_DAYS.includes(d))) {
      return res.status(400).json({ message: `availableDays must be an array of valid day names.` });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(availableHours !== undefined && { availableHours }),
        availableDays: JSON.stringify(availableDays),
      },
      select: { id: true, availableHours: true, availableDays: true },
    });

    return res.status(200).json({
      message: 'Availability updated.',
      availability: {
        availableHours: updated.availableHours,
        availableDays: updated.availableDays ? JSON.parse(updated.availableDays) : [],
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /students/search?q=&skill= ────────────────────────────────────────
/**
 * Searches students by name or skill name.
 * Query params: q (name search), skill (filter by skill name), page, limit.
 */
export const searchStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q = '', skill = '', page = '1', limit = '12' } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageSize;

    const where: any = {
      role: 'student',
      ...(q && {
        name: { contains: q, mode: 'insensitive' },
      }),
      ...(skill && {
        skills: {
          some: {
            skill: { name: { contains: skill, mode: 'insensitive' } },
          },
        },
      }),
    };

    const [total, students] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { xp: 'desc' },
        select: {
          id: true,
          name: true,
          specialization: true,
          avatarUrl: true,
          bio: true,
          availableHours: true,
          xp: true,
          level: true,
          skills: {
            take: 5,
            select: {
              level: true,
              skill: { select: { id: true, name: true } },
            },
          },
        },
      }),
    ]);

    return res.status(200).json({
      students: students.map((s) => ({
        ...s,
        skills: s.skills.map((us) => ({
          id: us.skill.id,
          name: us.skill.name,
          level: us.level,
        })),
      })),
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    next(err);
  }
};
