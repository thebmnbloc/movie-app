import express from 'express'
import userHandler from '../handlers/userHandler.js';



const router = express.Router();

router.get('/hello', userHandler);

export default router;