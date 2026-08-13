/**
 * @file        commitApi.ts
 * @description API utilities for commit operations
 */

import { api } from './api';

export interface CommitPayload {
  projectId: string;
  message: string;
  filesChanged?: number;
  additions?: number;
  deletions?: number;
}

/**
 * Log a new commit for a project
 */
export const logCommit = async (commit: CommitPayload) => {
  try {
    const response = await api.post('/commits/log', commit);
    return response.data;
  } catch (error) {
    console.error('Error logging commit:', error);
    throw error;
  }
};

/**
 * Get commit rankings for a project
 */
export const getCommitRankings = async (projectId: string) => {
  try {
    const response = await api.get(`/projects/${projectId}/commits/rankings`);
    return response.data;
  } catch (error) {
    console.error('Error fetching commit rankings:', error);
    throw error;
  }
};

/**
 * Get commit analytics for a project
 */
export const getCommitAnalytics = async (projectId: string) => {
  try {
    const response = await api.get(`/projects/${projectId}/commits/analytics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching commit analytics:', error);
    throw error;
  }
};

/**
 * Get user's commit stats in a project
 */
export const getUserCommitStats = async (projectId: string, userId: string) => {
  try {
    const response = await api.get(`/projects/${projectId}/commits/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user commit stats:', error);
    throw error;
  }
};

/**
 * Get commit timeline for a project
 */
export const getCommitTimeline = async (projectId: string, days: number = 30) => {
  try {
    const response = await api.get(`/projects/${projectId}/commits/timeline`, {
      params: { days },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching commit timeline:', error);
    throw error;
  }
};
