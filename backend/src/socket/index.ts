/**
 * @file        index.ts
 * @owner       IT + Networking Team (shared)
 * @description Socket connection entry handler managing validations and namespaces bindings.
 * @depends     backend/src/middleware/auth.ts, backend/src/socket/chatHandler.ts
 * @todo        Verify authentication details matching token configurations parameters.
 */

import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { initChatSocket } from './chatSocket';
import { initNotificationSocket } from './notificationHandler';

let io: Server | null = null;

/**
 * Initialize Socket.IO server with all event handlers
 */
export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 60000
  });

  // Middleware: Log all socket connections
  io.use((socket: Socket, next) => {
    const userId = socket.handshake.query.userId as string;
    if (!userId) {
      console.warn(`[Socket] Connection attempt without userId from ${socket.id}`);
      return next(new Error('Missing userId in handshake query'));
    }
    socket.data.userId = userId;
    next();
  });

  // Initialize chat socket handlers
  initChatSocket(io);

  // Initialize notification socket handlers
  initNotificationSocket(io);

  console.log('[Socket.IO] Initialized and ready to accept connections');

  return io;
};

/**
 * Get Socket.IO instance (singleton pattern)
 */
export const getIo = (): Server | null => {
  if (!io) {
    console.warn('[Socket.IO] Instance not initialized. Call initializeSocket first.');
  }
  return io;
};

/**
 * Broadcast message to specific room
 */
export const broadcastToRoom = (roomId: string, event: string, data: any) => {
  if (io) {
    io.to(roomId).emit(event, data);
  }
};

/**
 * Send message to specific user
 */
export const sendToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(userId).emit(event, data);
  }
};

/**
 * Broadcast to all connected clients
 */
export const broadcastAll = (event: string, data: any) => {
  if (io) {
    io.emit(event, data);
  }
};

export default io;
