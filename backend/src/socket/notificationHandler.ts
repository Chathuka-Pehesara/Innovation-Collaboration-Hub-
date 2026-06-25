/**
 * @file        notificationHandler.ts
 * @owner       IT + Networking Team (shared)
 * @description Websocket router sending instant alerts banners.
 * @depends     backend/src/socket/index.ts
 * @todo        Establish user id channels map filters targets.
 */

import { Server, Socket } from 'socket.io';

/**
 * Initialize notification socket event handlers
 * Handles real-time notification delivery to connected users
 */
export const initNotificationSocket = (io: Server) => {
  // Track online users
  const onlineUsers = new Set<string>();

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId as string;

    if (userId) {
      onlineUsers.add(userId);
      console.log(`[Notification] User "${userId}" connected (Socket ID: ${socket.id})`);

      // Notify other users that this user came online
      socket.broadcast.emit('user:online', { userId });
    }

    // Disconnect Handler
    socket.on('disconnect', () => {
      if (userId) {
        onlineUsers.delete(userId);
        console.log(`[Notification] User "${userId}" disconnected (Socket ID: ${socket.id})`);

        // Notify other users that this user went offline
        socket.broadcast.emit('user:offline', { userId });
      }
    });

    // Error Handler
    socket.on('error', (error) => {
      console.error(`[Notification] Socket error from ${userId}:`, error);
    });
  });
};

/**
 * Send notification to specific user via Socket.IO
 * Called from notification service when user is online
 */
export const sendNotificationToUser = (io: Server, userId: string, notification: any) => {
  if (io) {
    io.to(userId).emit('notification:new', notification);
    console.log(`[Notification] Sent to user ${userId}:`, notification.title);
  }
};

/**
 * Check if user is currently online via Socket.IO
 */
export const isUserOnlineViaSocket = (io: Server, userId: string): boolean => {
  if (!io) return false;
  const room = io.sockets.adapter.rooms.get(userId);
  return !!(room && room.size > 0);
};

export default { initNotificationSocket, sendNotificationToUser, isUserOnlineViaSocket };
