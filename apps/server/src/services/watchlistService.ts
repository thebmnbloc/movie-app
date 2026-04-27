// src/services/watchlist.service.ts
import { MovieRepository } from "../repositories/movieRepository";
import { WatchlistRepository } from "../repositories/watchlistRepository";

// const watchlistRepo = new WatchlistRepository();
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
  private watchlistRepo: WatchlistRepository;

  constructor(watchlistRepo: WatchlistRepository) {
    this.watchlistRepo = watchlistRepo;
  }

  async createWatchlist(userId: string, input: CreateWatchlistInput) {
    // Optional: business rules (e.g. max watchlists per user, name uniqueness per user)
    return this.watchlistRepo.create(userId, input);
  }

  async getWatchlistById(id: string, userId?: string) {
    const watchlist = await this.watchlistRepo.findById(id, userId);
    if (!watchlist) throw new Error("Watchlist not found or access denied");
    return watchlist;
  }

  async getMoviesInWatchlist(watchlistId: string, userId?: string) {
    const watchlist = await this.watchlistRepo.findById(watchlistId, userId);
    if (!watchlist) throw new Error("Watchlist not found or access denied");

    return this.watchlistRepo.getMovies(watchlistId);
  }

  async getUserWatchlists(
    userId: string,
    options: { isPublic?: boolean; page?: number; limit?: number } = {}
  ) {
    return this.watchlistRepo.findAllByUser(userId, options);
  }

  async updateWatchlist(id: string, input: UpdateWatchlistInput, userId: string) {
    // Ownership check
    const existing = await this.watchlistRepo.findById(id, userId);
    if (!existing) throw new Error("Watchlist not found or not owned by user");

    return this.watchlistRepo.update(id, input);
  }

  async deleteWatchlist(id: string, userId: string) {
    const existing = await this.watchlistRepo.findById(id, userId);
    if (!existing) throw new Error("Watchlist not found or not owned by user");

    return this.watchlistRepo.delete(id);
  }

  async addMovieToWatchlist(watchlistId: string, movieId: string, userId: string) {
    const watchlist = await this.watchlistRepo.findById(watchlistId, userId);
    if (!watchlist) throw new Error("Watchlist not found or access denied");

    // Optional: check movie exists
    // const movie = await movieRepo.findById(movieId);
    // if (!movie) throw new Error("Movie not found");

    const alreadyAdded = await watchlistRepo.isMovieInWatchlist(watchlistId, movieId);
    if (alreadyAdded) throw new Error("Movie already in watchlist");

    await this.watchlistRepo.addMovie(watchlistId, movieId);

    // Return updated watchlist or just success
    return this.watchlistRepo.findById(watchlistId, userId);
  }

  async removeMovieFromWatchlist(watchlistId: string, movieId: string, userId: string) {
    const watchlist = await this.watchlistRepo.findById(watchlistId, userId);
    if (!watchlist) throw new Error("Watchlist not found or access denied");

    const exists = await this.watchlistRepo.isMovieInWatchlist(watchlistId, movieId);
    if (!exists) throw new Error("Movie not in watchlist");

    await this.watchlistRepo.removeMovie(watchlistId, movieId);

    return this.watchlistRepo.findById(watchlistId, userId);
  }

  async isMovieInWatchlist(watchlistId: string, movieId: string, userId: string) {
    const watchlist = await this.watchlistRepo.findById(watchlistId, userId);
    if (!watchlist) throw new Error("Watchlist not found or access denied");

    return this.watchlistRepo.isMovieInWatchlist(watchlistId, movieId);
  }

  async updateMovieNotes(watchlistId: string, movieId: string, notes: string, userId: string) {
    const watchlist = await this.watchlistRepo.findById(watchlistId, userId);
    if (!watchlist) throw new Error("Watchlist not found or access denied");

    const exists = await this.watchlistRepo.isMovieInWatchlist(watchlistId, movieId);
    if (!exists) throw new Error("Movie not in watchlist");

    await this.watchlistRepo.updateMovieNotes(watchlistId, movieId, notes);

    return this.watchlistRepo.findById(watchlistId, userId);
  }

  async cloneWatchlist(watchlistId: string, userId: string) {
    const watchlist = await this.watchlistRepo.findById(watchlistId);
    if (!watchlist) throw new Error("Watchlist not found");

    // Create a copy of the watchlist
    const clonedWatchlist = await this.watchlistRepo.create(userId, {
      name: `Copy of ${watchlist.name}`,
      isPublic: watchlist.isPublic,
    });

    // Copy movies from the original watchlist to the cloned one
    for (const movie of watchlist.movies) {
      await this.watchlistRepo.addMovie(clonedWatchlist.id, movie.id);
    }

    return clonedWatchlist;
  }

  async getPublicWatchlists(page: number = 1, limit: number = 10) {
    return this.watchlistRepo.findAllPublic({ page, limit });
  }

  async getWatchlistsContainingMovie(movieId: string, page: number = 1, limit: number = 10) {
    return this.watchlistRepo.findAllContainingMovie(movieId, { page, limit });
  }

  async getWatchlistsByUser(userId: string, page: number = 1, limit: number = 10) {
    return this.watchlistRepo.findAllByUser(userId, { page, limit });
  }

  async getWatchlistStats(watchlistId: string) {
    const watchlist = await this.watchlistRepo.findById(watchlistId);
    if (!watchlist) throw new Error("Watchlist not found");

    // Get movie count
    const movieCount = await this.watchlistRepo.getMovieCount(watchlistId);

    return {
      id: watchlist.id,
      name: watchlist.name,
      isPublic: watchlist.isPublic,
      movieCount,
    };
  }

  async getWatchlistMovies(watchlistId: string) {
    const watchlist = await this.watchlistRepo.findById(watchlistId);
    if (!watchlist) throw new Error("Watchlist not found");

    return this.watchlistRepo.getMovies(watchlistId);
  }

  async addMoviesToWatchlist(watchlistId: string, movieIds: string[], userId: string) {
    const watchlist = await this.watchlistRepo.findById(watchlistId, userId);
    if (!watchlist) throw new Error("Watchlist not found or access denied");

    // Validate and add each movie
    for (const movieId of movieIds) {
      const exists = await this.watchlistRepo.isMovieInWatchlist(watchlistId, movieId);
      if (exists) throw new Error(`Movie ${movieId} already in watchlist`);

      await this.watchlistRepo.addMovie(watchlistId, movieId);
    }

    return this.watchlistRepo.findById(watchlistId, userId);
    }

   async removeMoviesFromWatchlist(watchlistId: string, movieIds: string[], userId: string) {
     const watchlist = await this.watchlistRepo.findById(watchlistId, userId);
     if (!watchlist) throw new Error("Watchlist not found or access denied");

     // Validate and remove each movie
     for (const movieId of movieIds) {
       const exists = await this.watchlistRepo.isMovieInWatchlist(watchlistId, movieId);
       if (!exists) throw new Error(`Movie ${movieId} not in watchlist`);

       await this.watchlistRepo.removeMovie(watchlistId, movieId);
     }

     return this.watchlistRepo.findById(watchlistId, userId);
   }

   async getTrendingWatchlists(page: number = 1, limit: number = 10) {
     return this.watchlistRepo.findTrending({ page, limit });
   }


   async getWatchlistByIdWithMovies(id: string, userId?: string) {
     const watchlist = await this.watchlistRepo.findById(id, userId);
     if (!watchlist) throw new Error("Watchlist not found or access denied");

     return this.watchlistRepo.getMovies(id);
   }

   async getUserWatchlistsWithMovies(userId: string, options: { isPublic?: boolean; page?: number; limit?: number } = {}) {
     const { watchlists, total, pagination } = await this.watchlistRepo.findAllByUser(userId, options);

     // Fetch movies for each watchlist
     const watchlistMovies = await Promise.all(
       watchlists.map(watchlist => this.watchlistRepo.getMovies(watchlist.id))
     );

     return {
       watchlists: watchlists.map((watchlist, index) => ({
         ...watchlist,
         movies: watchlistMovies[index],
       })),
       total,
       pagination,
     };
   }

  async getPublicWatchlistsWithMovies(page: number = 1, limit: number = 10) {
    const { watchlists, total, pagination } = await this.watchlistRepo.findAllPublic({ page, limit });

    // Fetch movies for each watchlist
    const watchlistMovies = await Promise.all(
      watchlists.map(watchlist => this.watchlistRepo.getMovies(watchlist.id))
    );

    return {
      watchlists: watchlists.map((watchlist, index) => ({
        ...watchlist,
        movies: watchlistMovies[index],
      })),
      total,
      pagination,
    };
  }

 async addMovieWithNotesToWatchlist(watchlistId: string, movieId: string, notes: string, userId: string) {
   const watchlist = await this.watchlistRepo.findById(watchlistId, userId);
   if (!watchlist) throw new Error("Watchlist not found or access denied");

   // Validate and add the movie with notes
   const exists = await this.watchlistRepo.isMovieInWatchlist(watchlistId, movieId);
   if (exists) throw new Error(`Movie ${movieId} already in watchlist`);

   await this.watchlistRepo.addMovieWithNotes(watchlistId, movieId, notes);
   return this.watchlistRepo.findById(watchlistId, userId);
  }

 async removeMovieWithNotesFromWatchlist(watchlistId: string, movieId: string, userId: string) {
   const watchlist = await this.watchlistRepo.findById(watchlistId, userId);
   if (!watchlist) throw new Error("Watchlist not found or access denied");

   // Validate and remove the movie with notes
   const exists = await this.watchlistRepo.isMovieInWatchlist(watchlistId, movieId);
   if (!exists) throw new Error(`Movie ${movieId} not in watchlist`);

   await this.watchlistRepo.removeMovieWithNotes(watchlistId, movieId);
   return this.watchlistRepo.findById(watchlistId, userId);
  }

  

}

