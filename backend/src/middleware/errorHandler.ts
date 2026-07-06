/**
 * @file        errorHandler.ts
 * @owner       Cybersecurity Team
 * @description Catch-all error handler sanitizing debug outputs variables.
 * @depends     None
 * @todo        Configure secure trace log output writes for tracking issues.
 */

import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  console.error('[Error Handler] Caught error:', err);

  const statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Check if error is a Prisma client initialization or connection error
  if (
    err instanceof Prisma.PrismaClientInitializationError ||
    (err.name === 'PrismaClientInitializationError')
  ) {
    message = 'Database connection failed. Please check your database configuration or server status.';
    return res.status(500).json({
      error: true,
      message,
      statusCode: 500,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && {
        code: err.errorCode,
        stack: err.stack,
      }),
    });
  }

  if (
    err instanceof Prisma.PrismaClientKnownRequestError ||
    (err.name === 'PrismaClientKnownRequestError')
  ) {
    // Database connection / host reachability codes
    const connectionErrorCodes = ['P1000', 'P1001', 'P1002', 'P1003', 'P1008', 'P1011', 'P1017'];
    if (connectionErrorCodes.includes(err.code)) {
      message = 'Database connection failed. Please check your database configuration or server status.';
      return res.status(500).json({
        error: true,
        message,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && {
          code: err.code,
          stack: err.stack,
        }),
      });
    }
  }

  // Fallback for other errors
  return res.status(statusCode).json({
    error: true,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
