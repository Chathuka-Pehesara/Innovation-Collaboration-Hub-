import { Response, NextFunction } from 'express';
import * as notificationService from '../services/notificationService';
import { AuthRequest } from '../middleware/auth';

// GET /notifications/:userId
export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    if (req.user?.userId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Cannot access other users\' notifications' });
    }

    const notifications = await notificationService.getUserNotifications(userId);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// PUT /notifications/:userId/:notifId/read
export const markRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId, notifId } = req.params;

    if (req.user?.userId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Cannot modify other users\' notifications' });
    }

    const notification = await notificationService.markNotificationAsRead(userId, notifId);
    res.json(notification);
  } catch (error) {
    next(error);
  }
};

// PUT /notifications/:userId/read-all
export const markAllRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    if (req.user?.userId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Cannot modify other users\' notifications' });
    }

    await notificationService.markAllNotificationsAsRead(userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// POST /notifications/trigger
export const triggerNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId, type, title, message, referenceId } = req.body;

    if (!userId || !type || !title || !message) {
      res.status(400).json({ error: 'userId, type, title, and message are required' });
      return;
    }

    const notification = await notificationService.createNotification(
      userId,
      type,
      title,
      message,
      referenceId
    );
    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
};

