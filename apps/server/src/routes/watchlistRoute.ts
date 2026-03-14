import express from 'express'
import watchlistHandler from '../handlers/watchlistHandler';

const router = express.Router();

router.get('/hello', watchlistHandler);

export default router;