// src/utils/ApiError.ts

/**
 * Custom API Error class for operational errors
 * Extends native Error with HTTP status codes
 */
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public status: string;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    // Capture stack trace, excluding the constructor call
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common HTTP status codes as static methods for convenience
export const badRequest = (message: string) => new ApiError(400, message);
export const unauthorized = (message: string) => new ApiError(401, message);
export const forbidden = (message: string) => new ApiError(403, message);
export const notFound = (message: string) => new ApiError(404, message);
export const conflict = (message: string) => new ApiError(409, message);
export const internalError = (message: string) => new ApiError(500, message);