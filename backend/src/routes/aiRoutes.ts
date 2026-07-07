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

const router = Router();

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
    if (!user || !user.id) {
      res.status(401).json({ error: 'Unauthorized: User session not found.' });
      return;
    }
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const result = await findTeammates(user.id, limit);
    res.json(result);
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
