import express from 'express'
import { 
  createWatchlist, 
  getWatchlistById, 
  getUserWatchlists, 
  getPublicWatchlists, 
  getWatchlistsContainingMovie, 
  deleteWatchlist, 
  updateMovieNotes, 
  updateWatchlist, 
  addMovieToWatchlist,
  isMovieInWatchlist,
  removeMovieFromWatchlist,
  cloneWatchlist
} from '../handlers/watchlistHandler';

const router = express.Router();

router.post('/', createWatchlist);
router.get('/:id', getWatchlistById);
router.get('/user/:userId', getUserWatchlists);
router.get('/public', getPublicWatchlists);
router.get('/movie/:movieId', getWatchlistsContainingMovie);
router.delete('/:id', deleteWatchlist);
router.put('/:id/movie/:movieId/notes', updateMovieNotes);
router.put('/:id', updateWatchlist);
router.post('/:id/movie', addMovieToWatchlist);

export default router;