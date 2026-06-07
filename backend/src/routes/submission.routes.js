import { Router } from 'express';
import SubmissionController from '../controllers/submission.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();

// Require login for all submission routes
router.use(authenticateJWT);

// Static routes first to prevent dynamic matching conflicts
router.get('/student', authorizeRoles('student'), SubmissionController.getStudentSubmissions);
router.get('/teacher', authorizeRoles('teacher'), SubmissionController.getTeacherSubmissions);

// Parameter routes
router.get('/:id', SubmissionController.getSubmissionById); // View specific graded test details
router.post('/:id/submit', authorizeRoles('student'), SubmissionController.submitExam); // Submit a taking test

export default router;
