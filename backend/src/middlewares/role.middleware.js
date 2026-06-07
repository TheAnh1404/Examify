import { errorResponse } from '../utils/response.js';

export const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, `Access denied. Role ${roles.join(' or ')} required.`, 403);
    }
    next();
  };
};
