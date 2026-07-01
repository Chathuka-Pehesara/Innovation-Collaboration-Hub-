/**
 * @file        validate.ts
 * @owner       Cybersecurity Team
 * @description Zod schema validation middleware factory.
 */

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          field: e.path.slice(1).join('.'), // strip 'body.' prefix
          message: e.message,
        }));
        return res.status(422).json({ message: 'Validation failed.', errors });
      }
      next(err);
    }
  };
};
