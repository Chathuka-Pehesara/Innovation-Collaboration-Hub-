import express from 'express';
import {
  getNotifications,
  markRead,
  markAllRead,
  triggerNotification
} from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Protect all notification routes with authentication middleware
router.use(authenticate);

// Routes
router.get('/:userId', getNotifications);
router.put('/:userId/:notifId/read', markRead);
router.put('/:userId/read-all', markAllRead);
router.post('/trigger', triggerNotification);

export default router;

