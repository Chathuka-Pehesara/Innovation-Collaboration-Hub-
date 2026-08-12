/**
 * @file        commitController.ts
 * @description Controller for commit-related endpoints
 */

import { Request, Response, NextFunction } from 'express';
import {
  logCommit,
  getCommitRankings,
  getProjectCommitAnalytics,
  getUserCommitStats,
  getCommitTimeline,
} from '../services/commitService';

/**
 * POST /commits/log
 * Log a new commit for a project
 */
export const createCommit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const userId = user?.id || user?.userId;
    const { projectId, message, filesChanged, additions, deletions } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    if (!projectId || !message) {
      return res.status(400).json({ error: 'Missing required fields: projectId, message' });
    }

    const commit = await logCommit(
      projectId,
      userId,
      message,
      filesChanged || 1,
      additions || 0,
      deletions || 0
    );

    res.status(201).json({
      message: 'Commit logged successfully',
      commit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /projects/:projectId/commits/rankings
 * Get commit rankings for a project (top contributors)
 */
export const getCommitRankingsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: 'Missing projectId' });
    }

    const rankings = await getCommitRankings(projectId);

    res.json({
      projectId,
      totalContributors: rankings.length,
      rankings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /projects/:projectId/commits/analytics
 * Get detailed analytics for project commits
 */
export const getCommitAnalyticsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: 'Missing projectId' });
    }

    const analytics = await getProjectCommitAnalytics(projectId);

    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /projects/:projectId/commits/user/:userId
 * Get user's commit stats in a project
 */
export const getUserCommitStatsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId, userId } = req.params;

    if (!projectId || !userId) {
      return res.status(400).json({ error: 'Missing projectId or userId' });
    }

    const stats = await getUserCommitStats(projectId, userId);

    if (!stats) {
      return res.status(404).json({ error: 'No commits found for this user in this project' });
    }

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /projects/:projectId/commits/timeline
 * Get commit timeline for a project
 */
export const getCommitTimelineController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;
    const { days = 30 } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'Missing projectId' });
    }

    const timeline = await getCommitTimeline(projectId, Number(days) || 30);

    res.json({
      projectId,
      days: Number(days) || 30,
      commitCount: timeline.length,
      commits: timeline,
    });
  } catch (error) {
    next(error);
  }
};
