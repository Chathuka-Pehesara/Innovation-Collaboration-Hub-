/**
 * @file        commitService.ts
 * @description Service for managing and tracking project commits
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CommitStats {
  userId: string;
  userName: string;
  avatarUrl: string | null;
  commitCount: number;
  additions: number;
  deletions: number;
  filesChanged: number;
  lastCommitDate: Date;
  rank: number;
}

export interface CommitAnalytics {
  projectId: string;
  totalCommits: number;
  totalContributors: number;
  topContributors: CommitStats[];
  recentCommits: any[];
}

/**
 * Log a new commit for a project
 */
export const logCommit = async (
  projectId: string,
  userId: string,
  message: string,
  filesChanged: number = 1,
  additions: number = 0,
  deletions: number = 0
) => {
  try {
    const commit = await prisma.commit.create({
      data: {
        projectId,
        userId,
        message,
        filesChanged,
        additions,
        deletions,
      },
    });
    return commit;
  } catch (error) {
    console.error('Error logging commit:', error);
    throw error;
  }
};

/**
 * Get commit rankings for a project (top contributors)
 */
export const getCommitRankings = async (projectId: string): Promise<CommitStats[]> => {
  try {
    const stats = await prisma.commit.groupBy({
      by: ['userId'],
      where: { projectId },
      _count: {
        id: true,
      },
      _sum: {
        additions: true,
        deletions: true,
        filesChanged: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // 🚀 PERFORMANCE FIX: Batch fetch all users in single query (not N queries)
    const userIds = stats.map(s => s.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, avatarUrl: true }
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    // Get most recent commit for each user - batch query
    const lastCommits = await prisma.commit.findMany({
      where: {
        projectId,
        userId: { in: userIds },
      },
      select: { userId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      distinct: ['userId'],
    });
    const lastCommitMap = new Map(lastCommits.map(c => [c.userId, c.createdAt]));

    // Build rankings with user info
    const rankings: CommitStats[] = stats.map((stat, index) => {
      const user = userMap.get(stat.userId);
      return {
        userId: stat.userId,
        userName: user?.name || 'Unknown User',
        avatarUrl: user?.avatarUrl || null,
        commitCount: stat._count.id,
        additions: stat._sum.additions || 0,
        deletions: stat._sum.deletions || 0,
        filesChanged: stat._sum.filesChanged || 0,
        lastCommitDate: lastCommitMap.get(stat.userId) || new Date(),
        rank: index + 1,
      };
    });

    return rankings;
  } catch (error) {
    console.error('Error getting commit rankings:', error);
    throw error;
  }
};

/**
 * Get detailed analytics for a project
 */
export const getProjectCommitAnalytics = async (projectId: string): Promise<CommitAnalytics> => {
  try {
    // Get total commits
    const totalCommits = await prisma.commit.count({
      where: { projectId },
    });

    // Get unique contributors
    const contributors = await prisma.commit.findMany({
      where: { projectId },
      distinct: ['userId'],
      select: { userId: true },
    });

    // Get top contributors with stats
    const topContributors = await getCommitRankings(projectId);

    // Get recent commits with user info
    const recentCommitsRaw = await prisma.commit.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        userId: true,
        message: true,
        filesChanged: true,
        additions: true,
        deletions: true,
        createdAt: true,
      },
    });

    // Batch fetch user info for recent commits
    const userIds = recentCommitsRaw.map(c => c.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, avatarUrl: true }
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    // Enrich recent commits with user info
    const recentCommits = recentCommitsRaw.map(commit => ({
      ...commit,
      userName: userMap.get(commit.userId)?.name || 'Unknown User',
      avatarUrl: userMap.get(commit.userId)?.avatarUrl || null,
    }));

    return {
      projectId,
      totalCommits,
      totalContributors: contributors.length,
      topContributors: topContributors.slice(0, 10), // Top 10 contributors
      recentCommits,
    };
  } catch (error) {
    console.error('Error getting commit analytics:', error);
    throw error;
  }
};

/**
 * Get user's commit stats across a project
 */
export const getUserCommitStats = async (
  projectId: string,
  userId: string
): Promise<CommitStats | null> => {
  try {
    const stats = await prisma.commit.groupBy({
      by: ['userId'],
      where: { projectId, userId },
      _count: {
        id: true,
      },
      _sum: {
        additions: true,
        deletions: true,
        filesChanged: true,
      },
    });

    if (stats.length === 0) return null;

    const stat = stats[0];
    const lastCommit = await prisma.commit.findFirst({
      where: { projectId, userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    // Fetch user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, avatarUrl: true }
    });

    // Get user's rank
    const rankings = await getCommitRankings(projectId);
    const userRank = rankings.find((r) => r.userId === userId)?.rank || 0;

    return {
      userId,
      userName: user?.name || 'Unknown User',
      avatarUrl: user?.avatarUrl || null,
      commitCount: stat._count.id,
      additions: stat._sum.additions || 0,
      deletions: stat._sum.deletions || 0,
      filesChanged: stat._sum.filesChanged || 0,
      lastCommitDate: lastCommit?.createdAt || new Date(),
      rank: userRank,
    };
  } catch (error) {
    console.error('Error getting user commit stats:', error);
    throw error;
  }
};

/**
 * Get commit activity timeline for a project
 */
export const getCommitTimeline = async (
  projectId: string,
  days: number = 30
): Promise<any[]> => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const commits = await prisma.commit.findMany({
      where: {
        projectId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        userId: true,
        message: true,
        filesChanged: true,
        additions: true,
        deletions: true,
        createdAt: true,
      },
    });

    return commits;
  } catch (error) {
    console.error('Error getting commit timeline:', error);
    throw error;
  }
};
