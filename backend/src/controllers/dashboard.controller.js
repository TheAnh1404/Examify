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
    const attempts = await prisma.examAttempt.findMany({
      where: { examId, status: 'SUBMITTED' },
      include: {
        student: { select: { fullName: true, email: true } }
      },
      orderBy: { score: 'desc' }
    });

    const scores = attempts.map(a => Number(a.score));
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    return successResponse(res, {
      totalAttempts: attempts.length,
      averageScore: averageScore.toFixed(2),
      attempts
    }, 'Exam statistics retrieved');
  } catch (error) {
    next(error);
  }
};
