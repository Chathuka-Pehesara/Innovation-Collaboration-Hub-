/**
 * @file        index.ts
 * @owner       IT Team
 * @description REST routes aggregator grouping endpoint routers under API directories.
 * @depends     backend/src/routes/auth.ts, backend/src/routes/users.ts
 * @todo        Define root status/health endpoint check parameters.
 */

import { Router } from 'express';

// Import all route modules
import authRoutes from './auth';
import usersRoutes from './users';
import projectRoutes from './projectRoutes';
import teamRoutes from './teamRoutes';
import chatRoutes from './chatRoutes';
import notificationRoutes from './notificationRoutes';
import analyticsRoutes from './analytics';

const router = Router();

/**
 * Health/Status endpoint
 */
router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'operational',
    service: 'Innovation Hub API',
    timestamp: new Date().toISOString()
  });
});

/**
 * Mount all route modules
 */
router.use('/auth', authRoutes);
router.use('/profile', usersRoutes); // Profile management routes
router.use('/students', usersRoutes); // Student search under /students/search
router.use('/users', usersRoutes);
router.use('/projects', projectRoutes);
router.use('/teams', teamRoutes);
router.use('/chats', chatRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
