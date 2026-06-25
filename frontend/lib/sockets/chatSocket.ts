import { io, Socket } from 'socket.io-client';
import { useChatStore } from '../store/chatStore';
import { useNotificationStore } from '../store/notificationStore';

let socket: Socket | null = null;
let pollingInterval: NodeJS.Timeout | null = null;

// Local mapping from userId to username to handle typing:stop events which only contain userId
const userIdToUsername = new Map<string, string>();

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const initSocket = (userId: string) => {
  if (socket) return socket;

  socket = io(SOCKET_SERVER_URL, {
    query: { userId },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000
  });

  socket.on('connect', () => {
    console.log('Socket client: Connected to server');
    useChatStore.getState().setSocketConnected(true);
    stopPollingFallback();

    const activeChatId = useChatStore.getState().activeChatId;
    if (activeChatId) {
      socket?.emit('join:chat', { chatId: activeChatId });
    }
  });

  socket.on('disconnect', () => {
    console.warn('Socket client: Disconnected. Initiating polling.');
    useChatStore.getState().setSocketConnected(false);
    startPollingFallback(userId);
  });

  // Listeners
  socket.on('message:new', (message) => {
    useChatStore.getState().receiveMessage(message);
  });

  socket.on('message:read', ({ chatId, userId: readerUserId }) => {
    useChatStore.getState().markMessagesAsReadLocal(chatId, readerUserId);
  });

  socket.on('typing:start', ({ chatId, userId: typistId, username }) => {
    userIdToUsername.set(typistId, username);
    useChatStore.getState().addTypingUser(chatId, username);
  });

  socket.on('typing:stop', ({ chatId, userId: typistId }) => {
    const username = userIdToUsername.get(typistId) || typistId;
    useChatStore.getState().removeTypingUser(chatId, username);
  });

  socket.on('notification:new', (notification) => {
    useNotificationStore.getState().addNotification(notification);
  });

  socket.on('user:status', ({ userId: statusUserId, status }) => {
    useChatStore.getState().updateUserOnlineStatus(statusUserId, status === 'online');
  });

  return socket;
};

const startPollingFallback = (userId: string) => {
  if (pollingInterval) return;

  pollingInterval = setInterval(async () => {
    const { activeChatId, fetchMessages } = useChatStore.getState();
    const { fetchNotifications } = useNotificationStore.getState();

    try {
      if (activeChatId) {
        await fetchMessages(activeChatId);
      }
      await fetchNotifications(userId);
    } catch (error) {
      console.error('Polling fallback error:', error);
    }
  }, 5000);
};

const stopPollingFallback = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

export const disconnectSocket = () => {
  stopPollingFallback();
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Emit Events
export const emitTypingStart = (chatId: string, userId: string, username: string) => {
  if (socket?.connected) {
    socket.emit('typing:start', { chatId, userId, username });
  }
};

export const emitTypingStop = (chatId: string, userId: string) => {
  if (socket?.connected) {
    socket.emit('typing:stop', { chatId, userId });
  }
};

export const emitReadReceipt = (chatId: string, userId: string) => {
  if (socket?.connected) {
    socket.emit('message:read', { chatId, userId });
  }
};

export const joinChat = (chatId: string) => {
  if (socket?.connected) {
    socket.emit('join:chat', { chatId });
  }
};

export const leaveChat = (chatId: string) => {
  if (socket?.connected) {
    socket.emit('leave:chat', { chatId });
  }
};
