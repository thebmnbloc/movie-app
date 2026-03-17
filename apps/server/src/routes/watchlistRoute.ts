import express from 'express';
import { WatchlistController } from '../controllers/watchlistController';




const router = express.Router();

const watchlistController = new WatchlistController();

router.post('/', watchlistController.createWatchlist.bind(watchlistController));
router.get('/:id', watchlistController.getWatchlistById.bind(watchlistController));
router.delete('/:id', watchlistController.deleteWatchlist.bind(watchlistController));
router.put('/:id/movie/:movieId/notes', watchlistController.updateMovieNotes.bind(watchlistController));
router.put('/:id', watchlistController.updateWatchlist.bind(watchlistController));
router.get('/:id/movies', watchlistController.getMoviesInWatchlist.bind(watchlistController));

export default router;
