/**
 * @file        commits.ts
 * @description Routes for commit tracking and analytics
 */

import { Router } from 'express';
import {
  createCommit,
  getCommitRankingsController,
  getCommitAnalyticsController,
  getUserCommitStatsController,
  getCommitTimelineController,
} from '../controllers/commitController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Require authentication for all commit routes
router.use(authenticate);

/**
 * POST /commits/log
 * Log a new commit (authenticated users only)
 */
router.post('/log', createCommit);

/**
 * GET /projects/:projectId/commits/rankings
 * Get top contributors ranking for a project
 */
router.get('/projects/:projectId/commits/rankings', getCommitRankingsController);

/**
 * GET /projects/:projectId/commits/analytics
 * Get detailed commit analytics for a project
 */
router.get('/projects/:projectId/commits/analytics', getCommitAnalyticsController);

/**
 * GET /projects/:projectId/commits/user/:userId
 * Get specific user's commit stats in a project
 */
router.get('/projects/:projectId/commits/user/:userId', getUserCommitStatsController);

/**
 * GET /projects/:projectId/commits/timeline
 * Get commit timeline (with optional days parameter)
 */
router.get('/projects/:projectId/commits/timeline', getCommitTimelineController);

export default router;
