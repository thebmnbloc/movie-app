import express from 'express';
import movieHandler from '../handlers/movieHandler';



const router = express.Router();

router.get('/', movieHandler);

export default router;