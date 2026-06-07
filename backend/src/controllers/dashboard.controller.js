import * as dashboardService from '../services/dashboard.service.js';
import prisma from '../utils/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getAdminDashboard = async (req, res, next) => {
  try {
    const stats = await dashboardService.getAdminStats();
    return successResponse(res, stats, 'Admin dashboard stats retrieved');
  } catch (error) {
    next(error);
  }
};

export const getTeacherDashboard = async (req, res, next) => {
  try {
    const stats = await dashboardService.getTeacherStats(req.user.id);
    return successResponse(res, stats, 'Teacher dashboard stats retrieved');
  } catch (error) {
    next(error);
  }
};

export const getStudentDashboard = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStudentStats(req.user.id);
    return successResponse(res, stats, 'Student dashboard stats retrieved');
  } catch (error) {
    next(error);
  }
};

export const getExamStatistics = async (req, res, next) => {
  try {
    const examId = parseInt(req.params.id);
    const stats = await dashboardService.getExamStats(examId, req.user.id, req.user.role);
    return successResponse(res, stats, 'Exam statistics retrieved');
  } catch (error) {
    next(error);
  }
};
