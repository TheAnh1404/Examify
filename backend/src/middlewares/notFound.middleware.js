import { errorResponse } from '../utils/response.js';

export const notFoundMiddleware = (req, res, next) => {
  return errorResponse(res, `Endpoint not found - ${req.originalUrl}`, 404);
};
