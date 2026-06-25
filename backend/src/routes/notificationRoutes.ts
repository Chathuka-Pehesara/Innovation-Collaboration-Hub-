import express from 'express';
import {
  getNotifications,
  markRead,
  markAllRead,
  triggerNotification
} from '../controllers/notificationController';

const router = express.Router();

// Routes
router.get('/:userId', getNotifications);
router.put('/:userId/:notifId/read', markRead);
router.put('/:userId/read-all', markAllRead);
router.post('/trigger', triggerNotification);

export default router;
