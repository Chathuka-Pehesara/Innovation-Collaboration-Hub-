import { io, Socket } from 'socket.io-client';
import { useChatStore } from '../store/chatStore';
import { useNotificationStore } from '../store/notificationStore';

let socket: Socket | null = null;
let pollingInterval: NodeJS.Timeout | null = null;

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const initSocket = (userId: string) => {
  if (socket) return socket;

  // Initialize socket client with query parameters for authentication
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

    // Re-join active chat if one is selected
    const activeChatId = useChatStore.getState().activeChatId;
    if (activeChatId) {
      socket?.emit('join:chat', { chatId: activeChatId });
    }
  });

  socket.on('disconnect', () => {
    console.warn('Socket client: Disconnected from server. Initiating polling fallback.');
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

  socket.on('typing:start', ({ chatId, userId: typistId }) => {
    useChatStore.getState().setTypingStatus(chatId, typistId, true);
  });

  socket.on('typing:stop', ({ chatId, userId: typistId }) => {
    useChatStore.getState().setTypingStatus(chatId, typistId, false);
  });

  socket.on('notification:new', (notification) => {
    useNotificationStore.getState().addNotification(notification);
  });

  socket.on('user:status', ({ userId: statusUserId, status }) => {
    useChatStore.getState().updateUserOnlineStatus(statusUserId, status === 'online');
  });

  return socket;
};

// Polling fallback to keep message stream and notifications synced when WS is down
const startPollingFallback = (userId: string) => {
  if (pollingInterval) return;

  console.log('Starting 5-second HTTP polling fallback...');
  pollingInterval = setInterval(async () => {
    const { activeChatId, fetchMessages } = useChatStore.getState();
    const { fetchNotifications } = useNotificationStore.getState();

    try {
      if (activeChatId) {
        await fetchMessages(activeChatId);
      }
      await fetchNotifications(userId);
    } catch (error) {
      console.error('Polling fallback fetch error:', error);
    }
  }, 5000);
};

const stopPollingFallback = () => {
  if (pollingInterval) {
    console.log('Stopping HTTP polling fallback.');
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
export const emitTypingStart = (chatId: string, userId: string) => {
  if (socket?.connected) {
    socket.emit('typing:start', { chatId, userId });
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
