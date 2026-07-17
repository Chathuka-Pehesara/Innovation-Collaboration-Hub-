/**
 * @file        profileApi.ts
 * @owner       IT Team
 * @description Profile management API service for frontend
 * @depends     axios
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Profile {
  id: string;
  name: string;
  email: string;
  specialization?: string;
  bio?: string;
  avatarUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  twitterUrl?: string;
  availableHours: number;
  availableDays: string[];
  xp: number;
  level: number;
  createdAt: string;
  skills: Skill[];
  portfolioItems: PortfolioItem[];
}

export interface Skill {
  id: string;
  name: string;
  level: string;
  score?: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Student extends Profile {
  specialization: string;
}

// ─── GET /profile/:id ────────────────────────────────────────────────────────
/**
 * Fetch a public student profile by ID
 */
export const getProfile = async (userId: string): Promise<Profile> => {
  const response = await apiClient.get(`/profile/${userId}`);
  return response.data.profile || response.data;
};

// ─── PUT /profile/:id ────────────────────────────────────────────────────────
/**
 * Update profile fields (name, bio, contact details, social links)
 */
export const updateProfile = async (
  userId: string,
  data: {
    name?: string;
    bio?: string;
    specialization?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    twitterUrl?: string;
  }
): Promise<Profile> => {
  const response = await apiClient.put(`/profile/${userId}`, data);
  return response.data.profile || response.data;
};

// ─── POST /profile/:id/avatar ───────────────────────────────────────────────
/**
 * Upload avatar image (multipart/form-data)
 */
export const uploadAvatar = async (userId: string, file: File): Promise<{ avatarUrl: string }> => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await apiClient.post(`/profile/${userId}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// ─── GET /profile/:id/skills ────────────────────────────────────────────────
/**
 * Fetch user's skills list
 */
export const getProfileSkills = async (userId: string): Promise<Skill[]> => {
  const response = await apiClient.get(`/profile/${userId}/skills`);
  return response.data.skills || [];
};

// ─── POST /profile/:id/skills ───────────────────────────────────────────────
/**
 * Add a skill to user's profile
 */
export const addSkill = async (
  userId: string,
  data: {
    skillId?: string;
    skillName?: string;
    level?: 'Beginner' | 'Intermediate' | 'Advanced';
  }
): Promise<Skill> => {
  const response = await apiClient.post(`/profile/${userId}/skills`, data);
  return response.data.skill || response.data;
};

// Gamification Quiz endpoints
export const generateQuiz = async (skillName: string) => {
  const response = await apiClient.post('/quizzes/generate', { skillName });
  return response.data;
};

export const evaluateQuiz = async (skillName: string, answers: number[]) => {
  const response = await apiClient.post('/quizzes/evaluate', { skillName, answers });
  return response.data;
};

// ─── DELETE /profile/:id/skills/:skillId ────────────────────────────────────
/**
 * Remove a skill from user's profile
 */
export const removeSkill = async (userId: string, skillId: string): Promise<void> => {
  await apiClient.delete(`/profile/${userId}/skills/${skillId}`);
};

// ─── GET /profile/:id/portfolio ─────────────────────────────────────────────
/**
 * Fetch user's portfolio items
 */
export const getPortfolio = async (userId: string): Promise<PortfolioItem[]> => {
  const response = await apiClient.get(`/profile/${userId}/portfolio`);
  return response.data.portfolioItems || [];
};

// ─── POST /profile/:id/portfolio ────────────────────────────────────────────
/**
 * Add a portfolio item
 */
export const addPortfolioItem = async (
  userId: string,
  data: {
    title: string;
    description?: string;
    url?: string;
    imageUrl?: string;
    tags?: string[];
  }
): Promise<PortfolioItem> => {
  const response = await apiClient.post(`/profile/${userId}/portfolio`, data);
  return response.data.item || response.data;
};

// ─── PUT /profile/:id/portfolio/:itemId ─────────────────────────────────────
/**
 * Update a portfolio item
 */
export const updatePortfolioItem = async (
  userId: string,
  itemId: string,
  data: {
    title?: string;
    description?: string;
    url?: string;
    imageUrl?: string;
    tags?: string[];
  }
): Promise<PortfolioItem> => {
  const response = await apiClient.put(`/profile/${userId}/portfolio/${itemId}`, data);
  return response.data.item || response.data;
};

// ─── DELETE /profile/:id/portfolio/:itemId ──────────────────────────────────
/**
 * Remove a portfolio item
 */
export const removePortfolioItem = async (userId: string, itemId: string): Promise<void> => {
  await apiClient.delete(`/profile/${userId}/portfolio/${itemId}`);
};

// ─── PUT /profile/:id/availability ──────────────────────────────────────────
/**
 * Update availability settings
 */
export const updateAvailability = async (
  userId: string,
  data: {
    availableHours?: number;
    availableDays?: string[];
  }
): Promise<{ availableHours: number; availableDays: string[] }> => {
  const response = await apiClient.put(`/profile/${userId}/availability`, data);
  return response.data.availability || response.data;
};

// ─── GET /students/search ───────────────────────────────────────────────────
/**
 * Search students by name or skill
 */
export const searchStudents = async (
  query?: string,
  skill?: string,
  page?: number,
  limit?: number
): Promise<{ students: Student[]; pagination: any }> => {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (skill) params.append('skill', skill);
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());

  const response = await apiClient.get(`/students/search?${params.toString()}`);
  return {
    students: response.data.students || [],
    pagination: response.data.pagination || {},
  };
};
