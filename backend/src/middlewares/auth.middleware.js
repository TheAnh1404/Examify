import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import prisma from '../utils/prisma.js';
import { errorResponse } from '../utils/response.js';

export const authMiddleware = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          status: true
        }
      });

      if (!user) {
        return errorResponse(res, 'User not found', 401);
      }

      if (user.status === 'LOCKED') {
        return errorResponse(res, 'Your account is locked. Please contact admin.', 403);
      }

      req.user = user;
      next();
    } catch (error) {
      return errorResponse(res, 'Not authorized, token failed', 401);
    }
  }

  if (!token) {
    return errorResponse(res, 'Not authorized, no token', 401);
  }
};
