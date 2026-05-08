import express from 'express';
import { createMovieController } from '../factories/movieFactory';

const router = express.Router();

const movieController = createMovieController();

router.post('/', movieController.createMovie.bind(movieController));
router.get('/:id', movieController.getMovieById.bind(movieController));
router.put('/:id', movieController.updateMovie.bind(movieController));
router.delete('/:id', movieController.deleteMovie.bind(movieController));
router.get('/slug/:slug', movieController.getMovieBySlug.bind(movieController));
router.get('/:id/stats', movieController.getMovieStats.bind(movieController));
router.get('/trending', movieController.getTrendingMovies.bind(movieController));
router.get('/', movieController.getMovies.bind(movieController));

export default router;