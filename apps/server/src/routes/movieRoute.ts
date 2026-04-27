import express from 'express';
import { MovieController } from '../controllers/movieController';
import { MovieService } from '../services/movieService';
import { MovieRepository } from '../repositories/movieRepository';

const router = express.Router();

const movieRepo = new MovieRepository();
const movieService = new MovieService(movieRepo);
const movieController = new MovieController(movieService);

router.post('/', movieController.createMovie.bind(movieController));
router.get('/:id', movieController.getMovieById.bind(movieController));
router.put('/:id', movieController.updateMovie.bind(movieController));
router.delete('/:id', movieController.deleteMovie.bind(movieController));
router.get('/slug/:slug', movieController.getMovieBySlug.bind(movieController));
router.get('/:id/stats', movieController.getMovieStats.bind(movieController));
router.get('/trending', movieController.getTrendingMovies.bind(movieController));
router.get('/', movieController.getMovies.bind(movieController));

export default router;