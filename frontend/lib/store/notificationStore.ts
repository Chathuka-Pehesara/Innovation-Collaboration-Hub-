import { create } from 'zustand';
import type { Notification } from '../../types/chat';
import * as chatApi from '../api/chatApi';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (userId: string, notifId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (userId: string) => {
    set({ isLoading: true });
    try {
      const data = await chatApi.getNotifications(userId);
      const unread = data.filter(n => !n.isRead).length;
      set({ notifications: data, unreadCount: unread });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (userId, notifId) => {
    try {
      await chatApi.markNotificationRead(userId, notifId);
      
      set((state) => {
        const nextNotifs = state.notifications.map(n => 
          n.id === notifId ? { ...n, isRead: true } : n
        );
        const unread = nextNotifs.filter(n => !n.isRead).length;
        return { notifications: nextNotifs, unreadCount: unread };
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async (userId) => {
    try {
      await chatApi.markNotificationsAllRead(userId);
      
      set((state) => {
        const nextNotifs = state.notifications.map(n => ({ ...n, isRead: true }));
        return { notifications: nextNotifs, unreadCount: 0 };
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  addNotification: (notification) => {
    set((state) => {
      // Avoid duplicate inserts
      const exists = state.notifications.some(n => n.id === notification.id);
      if (exists) return {};

      const nextNotifs = [notification, ...state.notifications];
      const unread = nextNotifs.filter(n => !n.isRead).length;
      
      // Dispatch local browser toast alert if possible
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(notification.title, { body: notification.message });
        }
      }

      return { notifications: nextNotifs, unreadCount: unread };
    });
  }
}));
