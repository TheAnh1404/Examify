import { Router } from 'express';
import ExamController from '../controllers/exam.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();

// Require login for all exam routes
router.use(authenticateJWT);

// Static routes first to prevent parameter collisions
router.get('/teacher/all', authorizeRoles('teacher', 'admin'), ExamController.getTeacherExams);
router.get('/', ExamController.getAllExams);
router.get('/:id', ExamController.getExamById); // Note: renamed to /teacher/all to avoid clash with /:id
router.post('/', authorizeRoles('teacher', 'admin'), ExamController.createExam);
router.put('/:id', authorizeRoles('teacher', 'admin'), ExamController.updateExam);
router.delete('/:id', authorizeRoles('teacher', 'admin'), ExamController.deleteExam);

export default router;
