import { Server, Socket } from 'socket.io';
import * as chatService from '../services/chatService';

let ioInstance: Server | null = null;

// Track online users directly via socket connections or room memberships
export const setIo = (io: Server) => {
  ioInstance = io;
};

export const getIo = (): Server | null => {
  return ioInstance;
};

// Check if a user is online by looking if their private room exists and is not empty
export const isUserOnline = (userId: string): boolean => {
  if (!ioInstance) return false;
  const room = ioInstance.sockets.adapter.rooms.get(userId);
  return !!(room && room.size > 0);
};

export const initChatSocket = (io: Server) => {
  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    // Read userId from handshake query
    const userId = socket.handshake.query.userId as string;
    
    if (userId) {
      // Join a private room unique to this user (e.g. for notifications and targeting)
      socket.join(userId);
      console.log(`Socket connection: User "${userId}" connected (Socket ID: ${socket.id})`);

      // Broadcast to all clients that this user is online
      io.emit('user:status', { userId, status: 'online' });
    }

    // Handle joining a specific chat channel/room
    socket.on('join:chat', ({ chatId }) => {
      if (chatId) {
        socket.join(chatId);
        console.log(`Socket ID ${socket.id} joined chat room: ${chatId}`);
      }
    });

    // Handle leaving a specific chat channel/room
    socket.on('leave:chat', ({ chatId }) => {
      if (chatId) {
        socket.leave(chatId);
        console.log(`Socket ID ${socket.id} left chat room: ${chatId}`);
      }
    });

    // Typing Indicators
    socket.on('typing:start', ({ chatId, userId: typingUserId }) => {
      if (chatId) {
        socket.to(chatId).emit('typing:start', { chatId, userId: typingUserId });
      }
    });

    socket.on('typing:stop', ({ chatId, userId: typingUserId }) => {
      if (chatId) {
        socket.to(chatId).emit('typing:stop', { chatId, userId: typingUserId });
      }
    });

    // Read Receipts
    socket.on('message:read', async ({ chatId, userId: readerUserId }) => {
      try {
        if (chatId && readerUserId) {
          // Update DB and broadcast event to room inside service
          await chatService.markChatAsRead(chatId, readerUserId);
        }
      } catch (error) {
        console.error('Error handling message:read event:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (userId) {
        console.log(`Socket connection: User "${userId}" disconnected`);
        // Wait a short duration to verify if this was just a refresh
        setTimeout(() => {
          if (!isUserOnline(userId)) {
            io.emit('user:status', { userId, status: 'offline' });
          }
        }, 3000);
      }
    });
  });
};
