import { Request, Response, NextFunction } from 'express';
import * as notificationService from '../services/notificationService';

// GET /notifications/:userId
export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const notifications = await notificationService.getUserNotifications(userId);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// PUT /notifications/:userId/:notifId/read
export const markRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, notifId } = req.params;
    const notification = await notificationService.markNotificationAsRead(userId, notifId);
    res.json(notification);
  } catch (error) {
    next(error);
  }
};

// PUT /notifications/:userId/read-all
export const markAllRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    await notificationService.markAllNotificationsAsRead(userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// POST /notifications/trigger
export const triggerNotification = async (req: Request, res: Response, next: NextFunction) => {
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
