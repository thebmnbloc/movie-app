// src/utils/errorHandler.ts
import { Request, Response, NextFunction} from 'express';
import { ApiError } from './ApiError.js';

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let status = 'error';

  // Handle known operational errors
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    status = err.status;
    
    // Log operational errors for monitoring
    console.log(`[Operational Error] ${statusCode}: ${message}`);
  } else {
    // Unknown/programming error - log full stack
    console.error('[Unexpected Error]', err);
  }

  res.status(statusCode).json({
    success: false,
    status,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack 
    })
  });
};