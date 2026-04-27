// src/routes/authRoutes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authorize, protect } from '../middlewares/authMiddleware';
import { AuthRepository } from '../repositories/authRepository';
import { AuthService } from '../services/authService';

const router = Router();

const authRepo = new AuthRepository();
const authService = new AuthService(authRepo);
const controller = new AuthController(authService);





router.post('/register', controller.register.bind(controller));
router.post('/login', controller.login.bind(controller));
router.post('/refresh', controller.refresh.bind(controller));
router.post('/logout', controller.logout.bind(controller));

// Protected example
router.post('/logout-all', controller.logoutAll.bind(controller));

export default router;