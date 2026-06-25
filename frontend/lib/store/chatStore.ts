import { create } from 'zustand';
import { Chat, Message } from '../../types/chat';
import * as chatApi from '../api/chatApi';

interface ChatState {
  conversations: Chat[];
  activeChatId: string | null;
  messages: Message[];
  onlineUsers: Set<string>;
  typingUsers: [string, string][]; // Array of [chatId, userId]
  isLoading: boolean;
  isSocketConnected: boolean;

  fetchConversations: (userId: string) => Promise<void>;
  setActiveChatId: (chatId: string | null) => void;
  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, userId: string, content: string) => Promise<void>;
  sendAttachment: (chatId: string, userId: string, file: File) => Promise<void>;
  receiveMessage: (message: Message) => void;
  setSocketConnected: (connected: boolean) => void;
  setTypingStatus: (chatId: string, userId: string, isTyping: boolean) => void;
  setOnlineUsers: (users: string[]) => void;
  updateUserOnlineStatus: (userId: string, isOnline: boolean) => void;
  markMessagesAsReadLocal: (chatId: string, userId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeChatId: null,
  messages: [],
  onlineUsers: new Set(),
  typingUsers: [],
  isLoading: false,
  isSocketConnected: true,

  fetchConversations: async (userId: string) => {
    set({ isLoading: true });
    try {
      // Build list of chats dynamically. Since there's no backend conversation listing,
      // we load active user conversations from local cache + add default Team chats.
      const cachedChats = localStorage.getItem(`chats_${userId}`);
      let chats: Chat[] = cachedChats ? JSON.parse(cachedChats) : [];

      // Always ensure a default Team Chat is present for testing
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
    
    // Clear unread counts for this chat
    if (chatId) {
      set((state) => {
        const nextConversations = state.conversations.map(c => 
          c.id === chatId ? { ...c, unreadCount: 0 } : c
        );
        
        // Save to cache
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

      // Optimistically append message locally if websocket hasn't broadcast it yet
      set((state) => {
        const exists = state.messages.some(m => m.id === message.id);
        if (exists) return {};
        return { messages: [...state.messages, message] };
      });

      // Track DM target user inside local conversations list
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
      // Append message
      set((state) => {
        const exists = state.messages.some(m => m.id === message.id);
        if (exists) return {};
        return { messages: [...state.messages, message] };
      });
    } else {
      // Increment unread count in conversations sidebar
      set((state) => {
        let chatExists = state.conversations.some(c => c.id === message.chatId);
        
        let nextConversations = [...state.conversations];
        
        if (!chatExists) {
          // If DM, create conversation card dynamically
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

  setTypingStatus: (chatId, userId, isTyping) => {
    set((state) => {
      let nextTyping = [...state.typingUsers];
      if (isTyping) {
        const exists = nextTyping.some(([c, u]) => c === chatId && u === userId);
        if (!exists) nextTyping.push([chatId, userId]);
      } else {
        nextTyping = nextTyping.filter(([c, u]) => !(c === chatId && u === userId));
      }
      return { typingUsers: nextTyping };
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
