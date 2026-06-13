import express from 'express';
import * as settingsController from '../controllers/settings.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = express.Router();

router.get('/public', settingsController.getPublicSettings);
router.get('/', authMiddleware, roleMiddleware('ADMIN'), settingsController.getSettings);
router.put('/', authMiddleware, roleMiddleware('ADMIN'), settingsController.updateSettings);

export default router;
