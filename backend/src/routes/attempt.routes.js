import express from 'express';
import * as attemptController from '../controllers/attempt.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/start', roleMiddleware('STUDENT'), attemptController.startAttempt);
router.post('/:id/answers', roleMiddleware('STUDENT'), attemptController.saveAnswers);
router.post('/:id/submit', roleMiddleware('STUDENT'), attemptController.submitAttempt);
router.get('/:id/result', attemptController.getAttemptResult);
router.get('/student/history', roleMiddleware('STUDENT'), attemptController.getStudentHistory);
router.get('/', roleMiddleware('ADMIN', 'TEACHER'), attemptController.getAllAttempts);

export default router;
