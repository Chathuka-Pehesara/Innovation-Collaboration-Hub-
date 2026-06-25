/**
 * @file        server.ts
 * @owner       IT + Cybersecurity Team
 * @description Backend initializer binding HTTP services and mounting Socket listeners.
 * @depends     backend/src/app.ts, backend/src/socket/index.ts
 * @todo        Launch Database engine connectors and Redis tasks queue configurations.
 */

import http from 'http';
import dotenv from 'dotenv';
import app from './app';
import { initializeSocket } from './socket';

// Load environment variables
dotenv.config();

// Environment variables
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create HTTP Server
const httpServer = http.createServer(app);

// Initialize Socket.IO with HTTP Server
initializeSocket(httpServer);

// Start Server
httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║  Innovation & Collaboration Hub - Backend  ║
╚════════════════════════════════════════════╝

Environment: ${NODE_ENV}
Server:      http://localhost:${PORT}
API:         http://localhost:${PORT}/api
Health:      http://localhost:${PORT}/health
Socket.IO:   ws://localhost:${PORT}

Timestamp:   ${new Date().toISOString()}
  `);
});

// Graceful Shutdown
process.on('SIGINT', () => {
  console.log('\n\n[SHUTDOWN] Received SIGINT signal. Gracefully shutting down...');
  httpServer.close(() => {
    console.log('[SHUTDOWN] HTTP server closed');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('[SHUTDOWN] Forced exit after timeout');
    process.exit(1);
  }, 10000);
});

process.on('SIGTERM', () => {
  console.log('\n\n[SHUTDOWN] Received SIGTERM signal. Gracefully shutting down...');
  httpServer.close(() => {
    console.log('[SHUTDOWN] HTTP server closed');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('[SHUTDOWN] Forced exit after timeout');
    process.exit(1);
  }, 10000);
});

// Error Handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]', reason);
  console.error('Promise:', promise);
});

process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT EXCEPTION]', error);
  process.exit(1);
});
