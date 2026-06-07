import { Router } from 'express';
import AdminController from '../controllers/admin.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();

// Secure all routes in this router to Admin only
router.use(authenticateJWT, authorizeRoles('admin'));

router.get('/stats', AdminController.getStats);
router.get('/users', AdminController.getAllUsers);
router.post('/users', AdminController.createUser);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);

export default router;
