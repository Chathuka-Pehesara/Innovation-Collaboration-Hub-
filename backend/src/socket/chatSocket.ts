import { Server, Socket } from 'socket.io';

let ioInstance: Server | null = null;

// Track online users directly via socket connections
export const setIo = (io: Server) => {
  ioInstance = io;
};

export const getIo = (): Server | null => {
  return ioInstance;
};

// Check if a user is online
export const isUserOnline = (userId: string): boolean => {
  if (!ioInstance) return false;
  const room = ioInstance.sockets.adapter.rooms.get(userId);
  return !!(room && room.size > 0);
};

export const initChatSocket = (io: Server) => {
  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    const userId = socket.handshake.query.userId as string || socket.data.userId;

    if (userId) {
      socket.join(userId);
      console.log(`[Socket] User "${userId}" joined private room`);
      io.emit('user:status', { userId, status: 'online' });
    }

    // Handle joining a specific chat channel
    socket.on('join:chat', ({ chatId }) => {
      if (chatId) {
        // Users join room: chat:{chatId}
        socket.join(`chat:${chatId}`);
        // Keep standard room too just in case messages depend on it
        socket.join(chatId);
        console.log(`[Socket] Socket ${socket.id} joined rooms: chat:${chatId} and ${chatId}`);
      }
    });

    // Handle leaving a specific chat channel
    socket.on('leave:chat', ({ chatId }) => {
      if (chatId) {
        socket.leave(`chat:${chatId}`);
        socket.leave(chatId);
        console.log(`[Socket] Socket ${socket.id} left rooms: chat:${chatId} and ${chatId}`);
      }
    });

    // Listen for typing:start
    socket.on('typing:start', (data: { chatId: string; userId: string; username: string }) => {
      const { chatId } = data;
      if (chatId) {
        // Broadcast to other users only in the same room
        socket.to(`chat:${chatId}`).emit('typing:start', data);
      }
    });

    // Listen for typing:stop
    socket.on('typing:stop', (data: { chatId: string; userId: string }) => {
      const { chatId } = data;
      if (chatId) {
        // Broadcast to other users only in the same room
        socket.to(`chat:${chatId}`).emit('typing:stop', data);
      }
    });

    socket.on('disconnect', () => {
      if (userId) {
        setTimeout(() => {
          if (!isUserOnline(userId)) {
            io.emit('user:status', { userId, status: 'offline' });
          }
        }, 3000);
      }
    });
  });
};
export default initChatSocket;
