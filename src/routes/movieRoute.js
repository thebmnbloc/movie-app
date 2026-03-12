import express from 'express'
import movieHandler from '../handlers/movieHandler.js';

const router = express.Router();

router.get('/hello', movieHandler);

export default router;