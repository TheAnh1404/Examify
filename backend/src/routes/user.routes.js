import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.put('/profile', userController.updateProfile);

router.use(roleMiddleware('ADMIN'));

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.patch('/:id/status', userController.updateStatus);
router.get('/:id/teaching-subjects', userController.getTeachingSubjects);
router.put('/:id/teaching-subjects', userController.updateTeachingSubjects);

export default router;
