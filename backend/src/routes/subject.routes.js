import express from 'express';
import * as subjectController from '../controllers/subject.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(authMiddleware);

// Admin & Teacher can read
router.get('/', roleMiddleware('ADMIN', 'TEACHER'), subjectController.getSubjects);
router.get('/:id', roleMiddleware('ADMIN', 'TEACHER'), subjectController.getSubjectById);

// Admin only for CUD
router.post('/', roleMiddleware('ADMIN'), subjectController.createSubject);
router.put('/:id', roleMiddleware('ADMIN'), subjectController.updateSubject);
router.delete('/:id', roleMiddleware('ADMIN'), subjectController.deleteSubject);

export default router;
