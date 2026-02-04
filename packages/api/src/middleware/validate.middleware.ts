import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Validation middleware factory
 * @param schema - Zod schema to validate against
 * @param target - Where to find the data to validate (body, query, params)
 */
export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[target];
      const validated = await schema.parseAsync(data);

      // Replace with validated & transformed data
      req[target] = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors,
        });
      }

      // Unexpected error
      console.error('Validation error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal validation error',
      });
    }
  };
};

/**
 * Shorthand validators
 */
export const validateBody = (schema: ZodSchema) => validate(schema, 'body');
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');
