import { errorResponse } from '../utils/response.js';

export const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, `Bạn không có quyền truy cập. Yêu cầu vai trò ${roles.join(' hoặc ')}.`, 403);
    }
    next();
  };
};
