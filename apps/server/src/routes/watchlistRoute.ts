import express from 'express';
import { WatchlistController } from '../controllers/watchlistController';




const router = express.Router();

const watchlistController = new WatchlistController();

router.post('/', watchlistController.createWatchlist.bind(watchlistController));
router.get('/:id', watchlistController.getWatchlistById.bind(watchlistController));
router.get('/user/:userId', watchlistController.getUserWatchlists.bind(watchlistController));
router.get('/public', watchlistController.getPublicWatchlists.bind(watchlistController));
router.get('/movie/:movieId', watchlistController.getWatchlistsContainingMovie.bind(watchlistController));
router.delete('/:id', watchlistController.deleteWatchlist.bind(watchlistController));
router.put('/:id/movie/:movieId/notes', watchlistController.updateMovieNotes.bind(watchlistController));
router.put('/:id', watchlistController.updateWatchlist.bind(watchlistController));
router.post('/:id/movie', watchlistController.addMovieToWatchlist.bind(watchlistController));

export default router;
