// src/routes/authRoutes.ts
import { Router } from 'express';
import { createAuthController } from '../factories/authFactory';

const router = Router();

const authController = createAuthController();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh', authController.refresh.bind(authController));
router.post('/logout', authController.logout.bind(authController));

// Protected example
router.post('/logout-all', authController.logoutAll.bind(authController));

export default router;