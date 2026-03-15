import express from 'express';
import { 
  createUser, 
  updateUser, 
  getUserByEmail, 
  getUserById, 
  getUserByUsername, 
  getUserStats, 
  deleteUser 
} from '../handlers/userHandler';

const router = express.Router();

router.post('/', createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/email/:email', getUserByEmail);
router.get('/username/:username', getUserByUsername);
router.get('/:id/stats', getUserStats);
router.get('/stats', getUserStats);
router.get('/email/:email/stats', getUserStats);
router.get('/username/:username/stats', getUserStats);


export default router;