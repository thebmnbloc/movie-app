import express from 'express';
import { 
  createMovie, 
  getMovieById, 
  updateMovie, 
  deleteMovie, 
  getMovieBySlug, 
  getMovieStats, 
  getTrendingMovies, 
  getMovies 
} from '../handlers/movieHandler';

const router = express.Router();

router.post('/', createMovie);
router.get('/:id', getMovieById);
router.put('/:id', updateMovie);
router.delete('/:id', deleteMovie);
router.get('/slug/:slug', getMovieBySlug);
router.get('/:id/stats', getMovieStats);
router.get('/trending', getTrendingMovies);
router.get('/', getMovies);

export default router;