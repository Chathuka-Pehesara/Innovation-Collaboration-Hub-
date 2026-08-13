import { Request, Response, NextFunction } from 'express';
import * as chatService from '../services/chatService';

// Helper to determine active userId from auth context or fallbacks for testing
const getUserId = (req: Request): string => {
  const user = (req as any).user;
  if (user?.id || user?.userId) {
    return user.id || user.userId;
  }
  const headerUserId = req.headers['x-user-id'] || req.query.userId;
  if (headerUserId) return headerUserId as string;
  return 'user_123'; // Default fallback
};

// GET /chats/team/:teamId/messages
export const getTeamMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
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
export const sendTeamMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
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
export const getDMMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activeUserId = getUserId(req);
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
export const sendDMMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activeUserId = getUserId(req);
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
export const uploadChatFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
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
