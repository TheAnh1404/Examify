import express from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/admin', roleMiddleware('ADMIN'), dashboardController.getAdminDashboard);
router.get('/teacher', roleMiddleware('TEACHER'), dashboardController.getTeacherDashboard);
router.get('/student', roleMiddleware('STUDENT'), dashboardController.getStudentDashboard);

// This one might also belong to exam.routes.js but following target structure
router.get('/exams/:id/statistics', roleMiddleware('TEACHER', 'ADMIN'), dashboardController.getExamStatistics);

export default router;
