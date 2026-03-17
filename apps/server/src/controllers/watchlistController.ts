// src/controllers/watchlist.controller.ts
import { Request, Response } from "express";
import { WatchlistService } from "../services/watchlistService";

const watchlistService = new WatchlistService();

// All routes should be protected with authenticate middleware
export class WatchlistController {
  async createWatchlist(req: Request,{user}, res: Response) {
    try {
      const userId = user!.id; // from auth middleware
      const watchlist = await watchlistService.createWatchlist(userId, req.body);
      res.status(201).json(watchlist);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getWatchlistById(req: Request<{ id: string }>, {user}, res: Response) {
    try {
      const { id } = req.params;
      const userId = user!.id; // optional for public watchlists
      const watchlist = await watchlistService.getWatchlistById(id, userId);
      res.json(watchlist);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message || "Watchlist not found" });
    }
  }

  async getMoviesInWatchlist(req: Request<{ id: string }>, {user}, res: Response) {
    try {
      const { id } = req.params;
      const userId = user!.id;
      const movies = await watchlistService.getMoviesInWatchlist(id, userId);
      res.json(movies);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message || "Watchlist not found" });
    }
  }

  async getMyWatchlists(req: Request,{user}, res: Response) {
    try {
      const userId = user!.id;
      const { page, limit, isPublic } = req.query as any;
      const result = await watchlistService.getUserWatchlists(userId, {
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        isPublic: isPublic === "true" ? true : undefined,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async updateWatchlist(req: Request<{ id: string }>, {user}, res: Response) {
    try {
      const { id } = req.params;
      const userId = user!.id;
      const updated = await watchlistService.updateWatchlist(id, req.body, userId);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async deleteWatchlist(req: Request<{ id: string }>, {user}, res: Response) {
    try {
      const { id } = req.params;
      const userId = user!.id;
      await watchlistService.deleteWatchlist(id, userId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async addMovie(req: Request<{ id: string }>, {user}, res: Response) {
    try {
      const { id } = req.params; // watchlistId
      const { movieId } = req.body;
      const userId = user!.id;

      if (!movieId) return res.status(400).json({ error: "movieId required" });

      const updatedWatchlist = await watchlistService.addMovieToWatchlist(id, movieId, userId);
      res.json(updatedWatchlist);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async removeMovie(req: Request<{ id: string; movieId: string }>, {user}, res: Response) {
    try {
      const { id, movieId } = req.params;
      const userId = user!.id;

      const updatedWatchlist = await watchlistService.removeMovieFromWatchlist(id, movieId, userId);
      res.json(updatedWatchlist);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async updateMovieNotes(req: Request<{ id: string; movieId: string }>, {user}, res: Response) {
    try {
      const { id, movieId } = req.params;
      const { notes } = req.body;
      const userId = user!.id;

      const updatedWatchlist = await watchlistService.updateMovieNotes(id, movieId, notes, userId);
      res.json(updatedWatchlist);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

}


/*
// Types
interface CreateWatchlistInput {
  name: string
  description?: string
  isPublic?: boolean
  userId: string
}

interface UpdateWatchlistInput {
  name?: string
  description?: string
  isPublic?: boolean
}

interface AddMovieInput {
  watchlistId: string
  movieId: string
  notes?: string
}

// CREATE
export async function createWatchlist(data: CreateWatchlistInput) {
  return prisma.watchlist.create({
    data,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      _count: {
        select: { movies: true },
      },
    },
  })
}

// READ
export async function getWatchlistById(id: string, requestingUserId?: string) {
  const watchlist = await prisma.watchlist.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      movies: {
        include: {
          movie: {
            select: {
              id: true,
              title: true,
              slug: true,
              posterUrl: true,
              releaseDate: true,
              rating: true,
              runtime: true,
              genres: true,
            },
          },
        },
        orderBy: { addedAt: 'desc' },
      },
      _count: {
        select: { movies: true },
      },
    },
  })

  // Check privacy - only owner can see private watchlists
  if (watchlist && !watchlist.isPublic && watchlist.userId !== requestingUserId) {
    return null
  }

  return watchlist
}

export async function getUserWatchlists(userId: string, includePrivate = false) {
  return prisma.watchlist.findMany({
    where: {
      userId,
      ...(includePrivate ? {} : { isPublic: true }),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { movies: true },
      },
      movies: {
        take: 4, // Preview first 4 movies
        include: {
          movie: {
            select: {
              id: true,
              posterUrl: true,
            },
          },
        },
      },
    },
  })
}

export async function getPublicWatchlists(page = 1, limit = 20) {
  const skip = (page - 1) * limit

  const [watchlists, total] = await Promise.all([
    prisma.watchlist.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: { movies: true },
        },
        movies: {
          take: 4,
          include: {
            movie: {
              select: {
                posterUrl: true,
              },
            },
          },
        },
      },
    }),
    prisma.watchlist.count({ where: { isPublic: true } }),
  ])

  return {
    watchlists,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// UPDATE
export async function updateWatchlist(
  id: string, 
  userId: string, 
  data: UpdateWatchlistInput
) {
  // Verify ownership
  const watchlist = await prisma.watchlist.findFirst({
    where: { id, userId },
  })

  if (!watchlist) {
    throw new Error('Watchlist not found or access denied')
  }

  return prisma.watchlist.update({
    where: { id },
    data,
    include: {
      _count: {
        select: { movies: true },
      },
    },
  })
}

// DELETE
export async function deleteWatchlist(id: string, userId: string) {
  // Verify ownership
  const watchlist = await prisma.watchlist.findFirst({
    where: { id, userId },
  })

  if (!watchlist) {
    throw new Error('Watchlist not found or access denied')
  }

  return prisma.watchlist.delete({
    where: { id },
  })
}

// ADD MOVIE TO WATCHLIST
export async function addMovieToWatchlist(data: AddMovieInput) {
  const { watchlistId, movieId, notes } = data

  return prisma.watchlistMovie.create({
    data: {
      watchlistId,
      movieId,
      notes,
    },
    include: {
      movie: true,
    },
  })
}

// REMOVE MOVIE FROM WATCHLIST
export async function removeMovieFromWatchlist(watchlistId: string, movieId: string) {
  return prisma.watchlistMovie.delete({
    where: {
      watchlistId_movieId: {
        watchlistId,
        movieId,
      },
    },
  })
}

// UPDATE MOVIE NOTES
export async function updateMovieNotes(
  watchlistId: string, 
  movieId: string, 
  notes: string
) {
  return prisma.watchlistMovie.update({
    where: {
      watchlistId_movieId: {
        watchlistId,
        movieId,
      },
    },
    data: { notes },
    include: {
      movie: true,
    },
  })
}

// CHECK IF MOVIE IS IN WATCHLIST
export async function isMovieInWatchlist(watchlistId: string, movieId: string) {
  const entry = await prisma.watchlistMovie.findUnique({
    where: {
      watchlistId_movieId: {
        watchlistId,
        movieId,
      },
    },
  })

  return !!entry
}

// GET WATCHLISTS CONTAINING MOVIE
export async function getWatchlistsContainingMovie(movieId: string, userId: string) {
  return prisma.watchlist.findMany({
    where: {
      userId,
      movies: {
        some: {
          movieId,
        },
      },
    },
    select: {
      id: true,
      name: true,
    },
  })
}

// CLONE WATCHLIST (Copy public watchlist to your account)
export async function cloneWatchlist(
  sourceWatchlistId: string, 
  targetUserId: string,
  newName?: string
) {
  const source = await prisma.watchlist.findUnique({
    where: { id: sourceWatchlistId },
    include: {
      movies: true,
    },
  })

  if (!source || !source.isPublic) {
    throw new Error('Watchlist not found or is private')
  }

  return prisma.watchlist.create({
    data: {
      name: newName || `${source.name} (Copy)`,
      description: source.description,
      isPublic: false, // Cloned watchlists are private by default
      userId: targetUserId,
      movies: {
        create: source.movies.map(m => ({
          movieId: m.movieId,
          notes: m.notes,
        })),
      },
    },
    include: {
      movies: {
        include: {
          movie: true,
        },
      },
    },
  })
}
*/