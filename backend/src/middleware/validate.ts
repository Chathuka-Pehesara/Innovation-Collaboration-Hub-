/**
 * @file        validate.ts
 * @owner       Cybersecurity Team
 * @description Zod schema validation middleware factory, with enhanced security logging and payload sanitization.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import prisma from '../prismaClient';

export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Perform strict validation and sanitize payload to strip unknown fields
      const parsed = await schema.parseAsync({ body: req.body, query: req.query, params: req.params });

      // Overwrite request payload with sanitized and validated output
      req.body = parsed.body || {};
      req.query = parsed.query || {};
      req.params = parsed.params || {};

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        // Collect safe error outlines (fields and reasons, NEVER raw sensitive values)
        const errors = err.errors.map((e) => ({
          field: e.path.slice(1).join('.'), // strip 'body.' prefix
          message: e.message,
          code: e.code,
        }));

        // Log MALFORMED_REQUEST or INVALID_INPUT to the SOC Threat Database
        // Fire & forget logging
        const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'Unknown';
        const type = errors.some(e => e.code === 'unrecognized_keys') ? 'MALFORMED_REQUEST' : 'INVALID_INPUT';

        prisma.threatLog.create({
          data: {
            ip,
            type,
            severity: 'LOW',
            fingerprint: 'sys_val_fail',
            metadata: JSON.stringify({ errors }),
          }
        }).catch((e: any) => console.error('[ThreatLog] Failed to record validation error', e));

        return res.status(422).json({ message: 'Validation failed.', errors });
      }
      next(err);
    }
  };
};
