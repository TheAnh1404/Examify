import express from 'express';
import * as classroomController from '../controllers/classroom.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(authMiddleware);

// Student enrollment routes (must be before /:id to avoid param conflicts)
router.get('/check-code/:code', roleMiddleware('STUDENT'), classroomController.checkClassCode);
router.post('/enroll', roleMiddleware('STUDENT'), classroomController.enrollRequest);
router.get('/my-requests', roleMiddleware('STUDENT'), classroomController.getMyRequests);

router.get('/', classroomController.getClassrooms);
router.get('/search-students', roleMiddleware('TEACHER', 'ADMIN'), classroomController.searchStudents);
router.get('/:id', classroomController.getClassroomById);

// Teacher enrollment management
router.get('/:id/enrollments', roleMiddleware('TEACHER'), classroomController.getEnrollmentRequests);
router.patch('/enrollments/:requestId', roleMiddleware('TEACHER'), classroomController.updateEnrollmentStatus);

// Teacher & Admin actions
router.post('/', roleMiddleware('TEACHER', 'ADMIN'), classroomController.createClassroom);
router.put('/:id', roleMiddleware('TEACHER', 'ADMIN'), classroomController.updateClassroom);
router.delete('/:id', roleMiddleware('TEACHER', 'ADMIN'), classroomController.deleteClassroom);

// Student management
router.post('/:id/students', roleMiddleware('TEACHER', 'ADMIN'), classroomController.addStudentToClass);
router.delete('/:id/students/:studentId', roleMiddleware('TEACHER', 'ADMIN'), classroomController.removeStudentFromClass);

export default router;

