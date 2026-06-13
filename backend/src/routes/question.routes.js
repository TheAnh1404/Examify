import express from 'express';
import * as questionController from '../controllers/question.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(authMiddleware);

// Only Admin and Teacher can access question pool
router.get('/', roleMiddleware('ADMIN', 'TEACHER'), questionController.getQuestions);
router.get('/:id', roleMiddleware('ADMIN', 'TEACHER'), questionController.getQuestionById);

// CUD only for Teacher (or Admin)
router.post('/bulk', roleMiddleware('TEACHER', 'ADMIN'), questionController.createQuestionsBulk);
router.post('/', roleMiddleware('TEACHER', 'ADMIN'), questionController.createQuestion);
router.put('/:id', roleMiddleware('TEACHER', 'ADMIN'), questionController.updateQuestion);
router.delete('/:id', roleMiddleware('TEACHER', 'ADMIN'), questionController.deleteQuestion);

export default router;
