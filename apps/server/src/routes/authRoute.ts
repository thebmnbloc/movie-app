// src/routes/authRoutes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authorize, protect } from '../middlewares/authMiddleware';

const router = Router();

const controller = new AuthController();



router.post('/register', controller.register.bind(controller));
router.post('/login', controller.login.bind(controller));
router.post('/refresh', controller.refresh.bind(controller));
router.post('/logout', controller.logout.bind(controller));

// Protected example
router.post('/logout-all', controller.logoutAll.bind(controller));

export default router;