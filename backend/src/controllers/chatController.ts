import { Response, NextFunction } from 'express';
import * as chatService from '../services/chatService';
import { AuthRequest } from '../middleware/auth';

// Helper to determine active userId strictly from authenticated user context
const getUserId = (req: AuthRequest): string | undefined => {
  return req.user?.userId;
};

// GET /chats/team/:teamId/messages
export const getTeamMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const { teamId } = req.params;
    const { limit = '50', before } = req.query;

    const parsedLimit = parseInt(limit as string, 10);
    const limitNum = isNaN(parsedLimit) || parsedLimit < 1 ? 50 : parsedLimit;

    const messages = await chatService.getTeamMessages(teamId, userId, limitNum, before as string | undefined);
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// POST /chats/team/:teamId/messages
export const sendTeamMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const { teamId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      res.status(400).json({ error: 'Message content cannot be empty' });
      return;
    }

    const message = await chatService.sendTeamMessage(teamId, userId, content);
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

// GET /chats/dm/:userId/messages
export const getDMMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const activeUserId = getUserId(req);
    if (!activeUserId) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const targetUserId = req.params.userId;
    const { limit = '50', before } = req.query;

    const parsedLimit = parseInt(limit as string, 10);
    const limitNum = isNaN(parsedLimit) || parsedLimit < 1 ? 50 : parsedLimit;

    const messages = await chatService.getDMMessages(activeUserId, targetUserId, limitNum, before as string | undefined);
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// POST /chats/dm/:userId/messages
export const sendDMMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const activeUserId = getUserId(req);
    if (!activeUserId) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const targetUserId = req.params.userId;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      res.status(400).json({ error: 'Message content cannot be empty' });
      return;
    }

    const message = await chatService.sendDMMessage(activeUserId, targetUserId, content);
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

// POST /chats/:chatId/files
export const uploadChatFile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const { chatId } = req.params;

    if (!(req as any).file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const fileUrl = `/uploads/${(req as any).file.filename}`;
    const fileName = (req as any).file.originalname;
    const fileType = (req as any).file.mimetype;

    const message = await chatService.saveChatFile(chatId, userId, fileUrl, fileName, fileType);
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

