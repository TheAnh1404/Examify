import { env } from '../config/env.js';
import { errorResponse } from '../utils/response.js';

export const errorMiddleware = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`);
  if (env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  return errorResponse(
    res, 
    message, 
    statusCode, 
    env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
};
