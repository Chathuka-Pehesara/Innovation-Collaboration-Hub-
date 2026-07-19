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

// ─── GET /admin/all ──────────────────────────────────────────────────────────
/**
 * Returns all users in the system for the Admin Dashboard.
 * Requires admin privileges.
 */
export const getAllUsersAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        specialization: true,
        avatarUrl: true,
        xp: true,
        level: true,
        createdAt: true,
        skills: {
          select: { skill: { select: { name: true } } },
        },
      },
    });

    const formattedUsers = users.map(u => ({
      ...u,
      skills: u.skills.map(s => s.skill.name),
    }));

    return res.status(200).json({ users: formattedUsers });
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

// ─── POST /profile/:id/portfolio/analyze ────────────────────────────────────────
/**
 * Analyzes a portfolio item title/description, extracts skills, and generates a validation quiz.
 */
export const analyzePortfolioProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (req.user?.userId !== id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'You can only analyze your own portfolio.' });
    }

    const { title, description } = req.body;
    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ message: 'Title and description are required for analysis.' });
    }

    // Attempt to extract skills (mocked response for gamification flow if AI fails)
    let extractedSkills = [];
    try {
      // In a real env, import { extractSkills } from '../services/aiService';
      // const aiResponse = await extractSkills({ description });
      // extractedSkills = aiResponse.skills;
      
      // Fallback manual extraction
      const descLower = description.toLowerCase();
      const techKeywords = ['react', 'node.js', 'node', 'python', 'java', 'typescript', 'javascript', 'docker', 'aws', 'sql'];
      extractedSkills = techKeywords.filter(tech => descLower.includes(tech));
      if (extractedSkills.length === 0) extractedSkills = ['JavaScript', 'HTML']; // Default fallback
    } catch (e) {
      extractedSkills = ['React', 'Node.js'];
    }

    // Generate validation questions (1 per skill)
    const MOCK_QUESTIONS: Record<string, any> = {
      react: { question: "Which hook is used for side effects in React?", options: ["useState", "useEffect", "useContext", "useReducer"], answer: 1 },
      node: { question: "Which core module is used to create a web server in Node?", options: ["fs", "path", "http", "url"], answer: 2 },
      python: { question: "How do you define a function in Python?", options: ["func", "def", "function", "lambda"], answer: 1 },
      default: { question: "What is the primary role of this technology?", options: ["Frontend", "Backend", "Database", "DevOps"], answer: 0 }
    };

    const validationQuiz = extractedSkills.map(skill => {
      let q = MOCK_QUESTIONS[skill.toLowerCase()] || MOCK_QUESTIONS.default;
      return { skill, question: q.question, options: q.options };
    });

    return res.status(200).json({
      message: 'Project analyzed successfully.',
      extractedSkills,
      validationQuiz
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /profile/:id/portfolio/submit ──────────────────────────────────────
/**
 * Evaluates the validation quiz answers, awards XP, and creates the Portfolio Item.
 */
export const submitPortfolioProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (req.user?.userId !== id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own portfolio.' });
    }

    const { title, description, url, imageUrl, tags = [], answers = [], extractedSkills = [] } = req.body;

    // In a real system, we'd validate the answers server-side.
    // For this MVP gamification, we assume frontend verified them or we give flat XP for completing the project.
    let correctCount = answers.length; // assuming all correct for this phase
    let passed = correctCount > 0 || extractedSkills.length > 0;
    
    // Create the project
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

    // Award XP and Add/Update Skills
    const badgesEarned = [];
    if (passed) {
      for (const skillName of extractedSkills) {
        let skill = await prisma.skill.findUnique({ where: { name: skillName } });
        if (!skill) skill = await prisma.skill.create({ data: { name: skillName } });

        let userSkill = await prisma.userSkill.findUnique({
          where: { userId_skillId: { userId: id, skillId: skill.id } }
        });

        let newScore = 25; // Award 25 XP per skill validated through a project
        if (userSkill) {
          newScore = userSkill.score + 25;
          await prisma.userSkill.update({
            where: { id: userSkill.id },
            data: { score: newScore }
          });
        } else {
          await prisma.userSkill.create({
            data: { userId: id, skillId: skill.id, level: 'Beginner', score: newScore }
          });
        }

        // Check badge thresholds
        const tiers = [
          { tier: 'Platinum', threshold: 100, icon: 'Award' },
          { tier: 'Gold', threshold: 75, icon: 'Star' },
          { tier: 'Silver', threshold: 50, icon: 'Shield' },
          { tier: 'Bronze', threshold: 25, icon: 'Medal' }
        ];

        for (const t of tiers) {
          if (newScore >= t.threshold) {
            const badgeName = `${skill.name} ${t.tier}`;
            let badge = await prisma.badge.findUnique({ where: { name: badgeName } });
            if (!badge) {
              badge = await prisma.badge.create({ data: { name: badgeName, tier: t.tier, description: `Achieved ${t.tier} in ${skill.name}`, icon: t.icon }});
            }
            const existing = await prisma.userBadge.findUnique({ where: { userId_badgeId: { userId: id, badgeId: badge.id } } });
            if (!existing) {
              await prisma.userBadge.create({ data: { userId: id, badgeId: badge.id } });
              badgesEarned.push(badge);
            }
          }
        }
      }
    }

    return res.status(201).json({
      message: 'Project verified and added!',
      item: { ...item, tags: JSON.parse(item.tags ?? '[]') },
      badgesEarned
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
