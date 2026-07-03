import { errorResponse } from '../utils/response.js';

export const notFoundMiddleware = (req, res, next) => {
  return errorResponse(res, `Không tìm thấy endpoint - ${req.originalUrl}`, 404);
};
