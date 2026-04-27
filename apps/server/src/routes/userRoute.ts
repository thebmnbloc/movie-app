// src/routes/userRoutes.ts
import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { UserService } from '../services/userService';
import { UserRepository } from '../repositories/userRepository';

const router = Router();

// Create instance once (or better: use dependency injection / container later)
const userRepo = new UserRepository();
const userService = new UserService(userRepo);
const userController = new UserController(userService);

// ────────────────────────────────────────────────
// Core CRUD routes
// ────────────────────────────────────────────────
router.post('/', userController.createUser.bind(userController));

router.get('/:id', userController.getUserById.bind(userController));

router.put('/:id', userController.updateUser.bind(userController));

router.delete('/:id', userController.deleteUser.bind(userController));

router.get('/', userController.getUsers.bind(userController)); // For pagination: /?page=1&limit=10

// ────────────────────────────────────────────────
// Lookup by unique fields (email / username)
// ────────────────────────────────────────────────
// These use body → not params (as implemented in your controller)
router.post('/by-email', userController.getUserByEmail.bind(userController));
router.post('/by-username', userController.getUserByUsername.bind(userController));

// Alternative style (if you prefer query string or want to change controller later):
// router.get('/email', userController.getUserByEmail.bind(userController));
// But then you'd need to change controller to read req.query.email

// ────────────────────────────────────────────────
// Stats routes
// ────────────────────────────────────────────────
// Only :id/stats makes sense — others were most likely mistakes
router.get('/:id/stats', userController.getUserStats.bind(userController));

// If you really want global stats (all users), you would need a new controller method
// router.get('/stats', userController.getGlobalStats.bind(userController));
// But you don't have such a method yet.

// Removed redundant/incorrect routes:
// router.get('/stats')
// router.get('/email/:email/stats')
// router.get('/username/:username/stats')

export default router;