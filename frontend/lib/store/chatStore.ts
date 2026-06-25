import { create } from 'zustand';
import { Chat, Message } from '../../types/chat';
import * as chatApi from '../api/chatApi';

interface ChatState {
  conversations: Chat[];
  activeChatId: string | null;
  messages: Message[];
  onlineUsers: Set<string>;
  typingUsers: Record<string, string[]>; // chatId -> username[]
  isLoading: boolean;
  isSocketConnected: boolean;

  fetchConversations: (userId: string) => Promise<void>;
  setActiveChatId: (chatId: string | null) => void;
  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, userId: string, content: string) => Promise<void>;
  sendAttachment: (chatId: string, userId: string, file: File) => Promise<void>;
  receiveMessage: (message: Message) => void;
  setSocketConnected: (connected: boolean) => void;
  addTypingUser: (chatId: string, username: string) => void;
  removeTypingUser: (chatId: string, username: string) => void;
  clearTypingUsers: (chatId: string) => void;
  setOnlineUsers: (users: string[]) => void;
  updateUserOnlineStatus: (userId: string, isOnline: boolean) => void;
  markMessagesAsReadLocal: (chatId: string, userId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeChatId: null,
  messages: [],
  onlineUsers: new Set(),
  typingUsers: {},
  isLoading: false,
  isSocketConnected: true,

  fetchConversations: async (userId: string) => {
    set({ isLoading: true });
    try {
      const cachedChats = localStorage.getItem(`chats_${userId}`);
      let chats: Chat[] = cachedChats ? JSON.parse(cachedChats) : [];

      const defaultTeamId = 'team_123';
      const hasDefaultTeam = chats.some(c => c.teamId === defaultTeamId);
      if (!hasDefaultTeam) {
        chats.unshift({
          id: defaultTeamId,
          name: 'Team Alpha Workspace',
          isGroup: true,
          teamId: defaultTeamId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          unreadCount: 0
        });
      }

      set({ conversations: chats });
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setActiveChatId: (chatId) => {
    set({ activeChatId: chatId });
    
    if (chatId) {
      set((state) => {
        const nextConversations = state.conversations.map(c => 
          c.id === chatId ? { ...c, unreadCount: 0 } : c
        );
        
        const userId = localStorage.getItem('userId') || 'user_123';
        localStorage.setItem(`chats_${userId}`, JSON.stringify(nextConversations));

        return { conversations: nextConversations };
      });
    }
  },

  fetchMessages: async (chatId) => {
    set({ isLoading: true });
    try {
      const userId = localStorage.getItem('userId') || 'user_123';
      let fetchedMessages: Message[] = [];
      
      if (chatId.startsWith('dm_')) {
        const targetUserId = chatId.replace('dm_', '');
        fetchedMessages = await chatApi.getDMMessages(userId, targetUserId);
      } else {
        fetchedMessages = await chatApi.getTeamMessages(chatId, userId);
      }
      
      set({ messages: fetchedMessages });
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (chatId, userId, content) => {
    try {
      let message: Message;
      
      if (chatId.startsWith('dm_')) {
        const targetUserId = chatId.replace('dm_', '');
        message = await chatApi.sendDMMessage(userId, targetUserId, content);
      } else {
        message = await chatApi.sendTeamMessage(chatId, userId, content);
      }

      set((state) => {
        const exists = state.messages.some(m => m.id === message.id);
        if (exists) return {};
        return { messages: [...state.messages, message] };
      });

      if (chatId.startsWith('dm_')) {
        const targetUserId = chatId.replace('dm_', '');
        set((state) => {
          const hasChat = state.conversations.some(c => c.id === chatId);
          if (hasChat) return {};

          const nextConversations = [...state.conversations, {
            id: chatId,
            name: targetUserId,
            isGroup: false,
            teamId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            unreadCount: 0
          }];
          localStorage.setItem(`chats_${userId}`, JSON.stringify(nextConversations));
          return { conversations: nextConversations };
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  },

  sendAttachment: async (chatId, userId, file) => {
    try {
      const message = await chatApi.uploadChatFile(chatId, userId, file);
      
      set((state) => {
        const exists = state.messages.some(m => m.id === message.id);
        if (exists) return {};
        return { messages: [...state.messages, message] };
      });
    } catch (error) {
      console.error('Error uploading file attachment:', error);
    }
  },

  receiveMessage: (message) => {
    const activeChatId = get().activeChatId;
    const isForActiveChat = activeChatId === message.chatId || 
                           (activeChatId?.startsWith('dm_') && message.chatId === activeChatId);

    if (isForActiveChat) {
      set((state) => {
        const exists = state.messages.some(m => m.id === message.id);
        if (exists) return {};
        return { messages: [...state.messages, message] };
      });
    } else {
      set((state) => {
        let chatExists = state.conversations.some(c => c.id === message.chatId);
        let nextConversations = [...state.conversations];
        
        if (!chatExists) {
          const isDM = !message.chatId.startsWith('team_') && message.senderId !== 'user_123';
          nextConversations.push({
            id: message.chatId,
            name: isDM ? message.senderId : 'Team Chat',
            isGroup: !isDM,
            teamId: isDM ? null : message.chatId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            unreadCount: 1
          });
        } else {
          nextConversations = state.conversations.map(c => 
            c.id === message.chatId 
              ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } 
              : c
          );
        }

        const userId = localStorage.getItem('userId') || 'user_123';
        localStorage.setItem(`chats_${userId}`, JSON.stringify(nextConversations));

        return { conversations: nextConversations };
      });
    }
  },

  setSocketConnected: (connected) => {
    set({ isSocketConnected: connected });
  },

  addTypingUser: (chatId, username) => {
    set((state) => {
      const list = state.typingUsers[chatId] || [];
      if (!list.includes(username)) {
        return {
          typingUsers: {
            ...state.typingUsers,
            [chatId]: [...list, username]
          }
        };
      }
      return {};
    });
  },

  removeTypingUser: (chatId, username) => {
    set((state) => {
      const list = state.typingUsers[chatId] || [];
      const filtered = list.filter(u => u !== username);
      return {
        typingUsers: {
          ...state.typingUsers,
          [chatId]: filtered
        }
      };
    });
  },

  clearTypingUsers: (chatId) => {
    set((state) => {
      return {
        typingUsers: {
          ...state.typingUsers,
          [chatId]: []
        }
      };
    });
  },

  setOnlineUsers: (users) => {
    set({ onlineUsers: new Set(users) });
  },

  updateUserOnlineStatus: (userId, isOnline) => {
    set((state) => {
      const nextOnline = new Set(state.onlineUsers);
      if (isOnline) {
        nextOnline.add(userId);
      } else {
        nextOnline.delete(userId);
      }
      return { onlineUsers: nextOnline };
    });
  },

  markMessagesAsReadLocal: (chatId, userId) => {
    const activeChatId = get().activeChatId;
    if (activeChatId === chatId) {
      set((state) => {
        const nextMessages = state.messages.map(m => {
          const hasReceipt = m.receipts?.some(r => r.userId === userId);
          if (hasReceipt) return m;

          const newReceipt = {
            id: Math.random().toString(),
            messageId: m.id,
            userId,
            readAt: new Date().toISOString()
          };
          return {
            ...m,
            receipts: [...(m.receipts || []), newReceipt]
          };
        });
        return { messages: nextMessages };
      });
    }
  }
}));
