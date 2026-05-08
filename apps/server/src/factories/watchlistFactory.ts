import { WatchlistRepository } from "../repositories/watchlistRepository";
import { WatchlistService } from "../services/watchlistService";
import { WatchlistController } from "../controllers/watchlistController";


export function createWatchlistController(): WatchlistController {
  const repo = new WatchlistRepository();
  const service = new WatchlistService(repo);
  const controller = new WatchlistController(service);
  
  return controller;
}
