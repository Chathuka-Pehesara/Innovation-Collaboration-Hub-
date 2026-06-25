import axios from 'axios';
import { Message, Notification } from '../../types/chat';

// Configure Axios base client pointing to backend server
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// GET /chats/team/:teamId/messages
export const getTeamMessages = async (teamId: string, userId: string, before?: string): Promise<Message[]> => {
  const response = await apiClient.get(`/chats/team/${teamId}/messages`, {
    params: { before },
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

// POST /chats/team/:teamId/messages
export const sendTeamMessage = async (teamId: string, userId: string, content: string): Promise<Message> => {
  const response = await apiClient.post(`/chats/team/${teamId}/messages`, { content }, {
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

// GET /chats/dm/:userId/messages
export const getDMMessages = async (activeUserId: string, targetUserId: string, before?: string): Promise<Message[]> => {
  const response = await apiClient.get(`/chats/dm/${targetUserId}/messages`, {
    params: { before },
    headers: { 'x-user-id': activeUserId }
  });
  return response.data;
};

// POST /chats/dm/:userId/messages
export const sendDMMessage = async (activeUserId: string, targetUserId: string, content: string): Promise<Message> => {
  const response = await apiClient.post(`/chats/dm/${targetUserId}/messages`, { content }, {
    headers: { 'x-user-id': activeUserId }
  });
  return response.data;
};

// POST /chats/:chatId/files
export const uploadChatFile = async (chatId: string, userId: string, file: File): Promise<Message> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post(`/chats/${chatId}/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'x-user-id': userId
    }
  });
  return response.data;
};

// GET /notifications/:userId
export const getNotifications = async (userId: string): Promise<Notification[]> => {
  const response = await apiClient.get(`/notifications/${userId}`);
  return response.data;
};

// PUT /notifications/:userId/:notifId/read
export const markNotificationRead = async (userId: string, notifId: string): Promise<Notification> => {
  const response = await apiClient.put(`/notifications/${userId}/${notifId}/read`);
  return response.data;
};

// PUT /notifications/:userId/read-all
export const markNotificationsAllRead = async (userId: string): Promise<void> => {
  await apiClient.put(`/notifications/${userId}/read-all`);
};
