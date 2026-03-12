import express from 'express'
import watchlistHandler from '../handlers/watchlistHandler.js';

const router = express.Router();

router.get('/hello', watchlistHandler);

export default router;