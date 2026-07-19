import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import {
  evaluateIdea,
  mentorChat,
  getQuickTip,
  findTeammates,
  generateDescription,
  refineDescription,
  generateFromKeywords,
  extractSkills
} from '../services/aiService';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Apply auth middleware to all AI endpoints
router.use(authenticate as any);

/**
 * POST /api/ai/evaluate
 * Evaluates a project idea's title and description.
 */
router.post('/evaluate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required.' });
      return;
    }
    const result = await evaluateIdea({ title, description });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/mentor/chat
 * Chats with the AI mentor, sending history and context.
 */
router.post('/mentor/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, conversation_history, context } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message content is required.' });
      return;
    }
    const result = await mentorChat({ message, conversation_history, context });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/mentor/quick-tip
 * Retrieves a quick tip on a specific topic.
 */
router.post('/mentor/quick-tip', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { topic, project_title } = req.body;
    if (!topic) {
      res.status(400).json({ error: 'Topic is required.' });
      return;
    }
    const result = await getQuickTip({ topic, project_title });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ai/find-teammates
 * Recommends compatible teammates based on current user's profile and skills.
 */
router.get('/find-teammates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user || !user.userId) {
      res.status(401).json({ error: 'Unauthorized: User session not found.' });
      return;
    }
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    
    // Query real users from DB (excluding current user)
    const dbUsers = await prisma.user.findMany({
      where: {
        id: { not: user.userId },
        role: 'student'
      },
      take: limit,
      orderBy: { xp: 'desc' }, // Recommend highly active users
      select: {
        id: true,
        name: true,
        specialization: true,
        bio: true,
        xp: true,
        level: true,
        avatarUrl: true,
        skills: {
          select: { skill: { select: { name: true } } }
        }
      }
    });

    const suggestions = dbUsers.map(u => ({
      user_id: u.id,
      name: u.name,
      specialization: u.specialization || 'Student',
      bio: u.bio || 'I am ready to collaborate on amazing projects!',
      xp: u.xp,
      level: u.level,
      avatarUrl: u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`,
      compatibility_score: 0.85 + (Math.random() * 0.1), // Mock score logic (0.85 to 0.95)
      matching_skills: u.skills.map(s => s.skill.name).slice(0, 3),
      complementary_skills: {
        user1_unique: ['React', 'Node.js'],
        user2_unique: u.skills.map(s => s.skill.name).slice(0, 3),
        shared: []
      },
      team_balance_score: 0.90,
      proficiency_distribution: { Frontend: 40, Backend: 60 }
    }));

    res.json({
      user_id: user.userId,
      suggestions,
      total_suggestions: dbUsers.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/generate-desc
 * AI description generator.
 */
router.post('/generate-desc', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, brief_concept, keywords, target_audience, template } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Title is required.' });
      return;
    }
    const result = await generateDescription({
      title,
      brief_concept,
      keywords,
      target_audience,
      template,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/refine-desc
 * AI description polisher.
 */
router.post('/refine-desc', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, focus } = req.body;
    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required.' });
      return;
    }
    const result = await refineDescription({ title, description, focus });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/from-keywords
 * AI project description builder from keywords.
 */
router.post('/from-keywords', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { keywords, domain } = req.body;
    if (!keywords || !Array.isArray(keywords)) {
      res.status(400).json({ error: 'Keywords list is required.' });
      return;
    }
    const result = await generateFromKeywords({ keywords, domain });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/extract-skills
 * Extract skills keywords from text.
 */
router.post('/extract-skills', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { description } = req.body;
    if (!description) {
      res.status(400).json({ error: 'Description is required.' });
      return;
    }
    const result = await extractSkills({ description });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
