import express from 'express';
import * as examController from '../controllers/exam.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', examController.getExams);
router.get('/:id', examController.getExamById);

// Teacher/Admin only for CUD and management
router.post('/', roleMiddleware('TEACHER', 'ADMIN'), examController.createExam);
router.put('/:id', roleMiddleware('TEACHER', 'ADMIN'), examController.updateExam);
router.delete('/:id', roleMiddleware('TEACHER', 'ADMIN'), examController.deleteExam);

// Question management
router.post('/:id/questions', roleMiddleware('TEACHER', 'ADMIN'), examController.addQuestionToExam);
router.delete('/:id/questions/:questionId', roleMiddleware('TEACHER', 'ADMIN'), examController.removeQuestionFromExam);

// Student assignment management
router.post('/:id/students', roleMiddleware('TEACHER', 'ADMIN'), examController.assignStudents);
router.delete('/:id/students/:studentId', roleMiddleware('TEACHER', 'ADMIN'), examController.removeStudent);
router.get('/:id/students', roleMiddleware('TEACHER', 'ADMIN'), examController.getAssignedStudents);

// Lifecycle management
router.patch('/:id/publish', roleMiddleware('TEACHER', 'ADMIN'), examController.publishExam);
router.patch('/:id/close', roleMiddleware('TEACHER', 'ADMIN'), examController.closeExam);

export default router;
