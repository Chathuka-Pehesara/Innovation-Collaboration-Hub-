import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = (req as any).id || 'unknown';

  // 1. Secure Logging Pipeline
  // We explicitly log to standard out (or future file logger) so SOC team can trace.
  console.error(`[ERROR] [ReqID: ${requestId}] URL: ${req.originalUrl} | Method: ${req.method}`);
  console.error(`[ERROR] [ReqID: ${requestId}] Message:`, err?.message || err);
  if (err?.stack) {
    console.error(`[ERROR] [ReqID: ${requestId}] StackTrace:`, err.stack);
  }

  // 2. Data Loss Prevention Filter
  // Never expose: stack traces, DB errors, SQL errors, secret configs, or file paths
  let statusCode = err.statusCode || err.status || 500;
  let clientMessage = 'Internal Server Error';

  if (statusCode === 400) clientMessage = 'Bad Request';
  else if (statusCode === 401) clientMessage = 'Unauthorized';
  else if (statusCode === 403) clientMessage = 'Forbidden';
  else if (statusCode === 404) clientMessage = 'Not Found';
  else if (statusCode === 429) clientMessage = 'Too Many Requests';
  else if (statusCode >= 400 && statusCode < 500 && err.message) {
    // If it's a generic 4xx that is explicitly thrown (e.g. 422 Validation Error),
    // and the message does not contain DB errors or file paths, we allow it softly.
    // However, to strictly comply with "Use safe responses such as 400, 401, 403, 429",
    // we map generic errors aggressively.
    if (statusCode === 422) {
      clientMessage = 'Validation Failed';
    } else {
      clientMessage = 'Client Request Error';
    }
  }

  // Detect Express Built-in JSON SyntaxError
  if (err instanceof SyntaxError && statusCode === 400 && 'body' in err) {
    statusCode = 400;
    clientMessage = 'Malformed JSON Payload';
  }

  // Prisma Client Errors (Ensure they are explicitly masked into 500 mappings)
  if (err?.name?.startsWith('PrismaClient') || err?.code?.startsWith('P')) {
    statusCode = 500;
    clientMessage = 'Internal Server Error';
  }

  // 3. Normalized Safe Output
  return res.status(statusCode).json({
    error: true,
    message: clientMessage,
    requestId,
    statusCode,
    timestamp: new Date().toISOString(),
  });
};
