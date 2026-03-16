// src/services/watchlist.service.ts
import { MovieRepository } from "../repositories/movieRepository";
import { WatchlistRepository } from "../repositories/watchlistRepository";

const watchlistRepo = new WatchlistRepository();
const movieRepo = new MovieRepository(); // if needed for movie existence check

export interface CreateWatchlistInput {
  name: string;
  isPublic?: boolean;
}

export interface UpdateWatchlistInput {
  name?: string;
  isPublic?: boolean;
}

export class WatchlistService {
  async createWatchlist(userId: string, input: CreateWatchlistInput) {
    // Optional: business rules (e.g. max watchlists per user, name uniqueness per user)
    return watchlistRepo.create(userId, input);
  }

  async getWatchlistById(id: string, userId?: string) {
    const watchlist = await watchlistRepo.findById(id, userId);
    if (!watchlist) throw new Error("Watchlist not found or access denied");
    return watchlist;
  }

  async getUserWatchlists(
    userId: string,
    options: { isPublic?: boolean; page?: number; limit?: number } = {}
  ) {
    return watchlistRepo.findAllByUser(userId, options);
  }

  async updateWatchlist(id: string, input: UpdateWatchlistInput, userId: string) {
    // Ownership check
    const existing = await watchlistRepo.findById(id, userId);
    if (!existing) throw new Error("Watchlist not found or not owned by user");

    return watchlistRepo.update(id, input);
  }

  async deleteWatchlist(id: string, userId: string) {
    const existing = await watchlistRepo.findById(id, userId);
    if (!existing) throw new Error("Watchlist not found or not owned by user");

    return watchlistRepo.delete(id);
  }

  async addMovieToWatchlist(watchlistId: string, movieId: string, userId: string) {
    const watchlist = await watchlistRepo.findById(watchlistId, userId);
    if (!watchlist) throw new Error("Watchlist not found or access denied");

    // Optional: check movie exists
    // const movie = await movieRepo.findById(movieId);
    // if (!movie) throw new Error("Movie not found");

    const alreadyAdded = await watchlistRepo.isMovieInWatchlist(watchlistId, movieId);
    if (alreadyAdded) throw new Error("Movie already in watchlist");

    await watchlistRepo.addMovie(watchlistId, movieId);

    // Return updated watchlist or just success
    return watchlistRepo.findById(watchlistId, userId);
  }

  async removeMovieFromWatchlist(watchlistId: string, movieId: string, userId: string) {
    const watchlist = await watchlistRepo.findById(watchlistId, userId);
    if (!watchlist) throw new Error("Watchlist not found or access denied");

    const exists = await watchlistRepo.isMovieInWatchlist(watchlistId, movieId);
    if (!exists) throw new Error("Movie not in watchlist");

    await watchlistRepo.removeMovie(watchlistId, movieId);

    return watchlistRepo.findById(watchlistId, userId);
  }
}