// src/repositories/watchlist.repository.ts
import { prisma } from "../config/db";
import { Prisma, Watchlist as watchlist} from "../generated/prisma/client";


export class WatchlistRepository {
  async create(userId: string, data: { name: string; isPublic?: boolean }) {
    return prisma.watchlist.create({
      data: {
        ...data,
        userId,
      },
      include: {
        movies: {
          include: {
            movie: {
              include: {
                genres: true,
              },
            },
          },
          orderBy: { addedAt: "desc" },
        },
        _count: {
          select: { movies: true },
        },
      },
    });
  }

  async findById(id: string, userId?: string) {
    const where: Prisma.WatchlistWhereInput = { id };
    if (userId) where.userId = userId; // optional ownership check

    return prisma.watchlist.findFirst({
      where,
      include: {
        movies: {
          include: {
            movie: {
              include: {
                genres: true,
                _count: { select: { reviews: true } },
              },
            },
          },
          orderBy: { addedAt: "desc" },
        },
        user: {
          select: { id: true, username: true, avatar: true },
        },
        _count: { select: { movies: true } },
      },
    });
  }

  async findAllByUser(userId: string, options: { isPublic?: boolean; page?: number; limit?: number } = {}) {
    const { page = 1, limit = 20, isPublic } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.WatchlistWhereInput = { userId };
    if (isPublic !== undefined) where.isPublic = isPublic;

    const [watchlists, total] = await Promise.all([
      prisma.watchlist.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { movies: true } },
          movies: {
            take: 4, // preview first few movies
            include: { movie: { select: { id: true, title: true, posterUrl: true } } },
          },
        },
      }),
      prisma.watchlist.count({ where }),
    ]);

    return { watchlists, total, pagination: { page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async update(id: string, data: { name?: string; isPublic?: boolean }) {
    return prisma.watchlist.update({
      where: { id },
      data,
      include: { _count: { select: { movies: true } } },
    });
  }

  async delete(id: string) {
    return prisma.watchlist.delete({ where: { id } });
  }

  async addMovie(watchlistId: string, movieId: string) {
    return prisma.watchlistMovie.create({
      data: {
        watchlistId,
        movieId,
      },
    });
  }

  async removeMovie(watchlistId: string, movieId: string) {
    return prisma.watchlistMovie.delete({
      where: {
        watchlistId_movieId: { watchlistId, movieId },
      },
    });
  }

  async isMovieInWatchlist(watchlistId: string, movieId: string) {
    return !!(await prisma.watchlistMovie.findUnique({
      where: { watchlistId_movieId: { watchlistId, movieId } },
    }));
  }

  async getMovieCount(watchlistId: string) {
    return prisma.watchlistMovie.count({ where: { watchlistId } });
  }

  async removeMovieWithNotes(movieId: string) {
      return prisma.watchlistMovie.deleteMany({
        where: { movieId }
      });
  }

  async updateMovieNotes(watchlistId: string, movieId: string, notes: string) {
    return prisma.watchlistMovie.update({
      where: {
        watchlistId_movieId: { watchlistId, movieId },
      },
      data: {
        notes,
      },
    });
  }

  async findAllPublic(options: { page?: number; limit?: number } = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [watchlists, total] = await Promise.all([
      prisma.watchlist.findMany({
        where: { isPublic: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { movies: true } },
          movies: {
            take: 4, // preview first few movies
            include: { movie: { select: { id: true, title: true, posterUrl: true } } },
          },
        },
      }),
      prisma.watchlist.count({ where: { isPublic: true } }),
    ]);

    return { watchlists, total, pagination: { page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getMovies(watchlistId: string) {
    return prisma.watchlistMovie.findMany({
      where: { watchlistId },
      include: {
        movie: {
          include: {
            genres: true,
          },
        },
      },
    });
  }

    async getWatchlistsContainingMovie(
    movieId: string,
    options: { page?: number; limit?: number } = {}
  ) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [watchlists, total] = await Promise.all([
      prisma.watchlist.findMany({
        where: {
          movies: {
            some: {
              movieId: movieId,   // ← this is the correct way
            },
          },
        },
        skip,
        take: limit,
        // You can add ordering if it makes sense
        orderBy: [
          { updatedAt: 'desc' },   // or createdAt, name, etc.
        ],
        // Optional: select or include only needed fields
        // select: { id: true, name: true, createdAt: true, userId: true },
        // include: { user: { select: { username: true } } },
      }),

      prisma.watchlist.count({
        where: {
          movies: {
            some: {
              movieId: movieId,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 0;

    return {
      watchlists,
      total,
      pagination: {
        page,
        limit,
        totalPages,
      },
    };
  }

  async findTrending(options: { page?: number; limit?: number } = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [watchlists, total] = await Promise.all([
      prisma.watchlist.findMany({
        where: { isPublic: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { movies: true } },
          movies: {
            take: 4, // preview first few movies
            include: { movie: { select: { id: true, title: true, posterUrl: true } } },
          },
        },
      }),
      prisma.watchlist.count({ where: { isPublic: true } }),
    ]);

    return { watchlists, total, pagination: { page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async addMovieWithNotes(watchlistId: string, movieId: string, notes: string) {
    return prisma.watchlistMovie.create({
      data: {
        watchlistId,
        movieId,
        notes,
      },
    });
  }

  async removeMovieFromAllWatchlists(movieId: string) {    return prisma.watchlistMovie.deleteMany({
      where: { movieId }
    });
  }

  async findAllContainingMovie(
  movieId: string,
  options: { page?: number; limit?: number } = {}
) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  // ── First get all watchlist IDs that contain this movie ──
  const watchlistIds = await prisma.watchlistMovie.findMany({
    where: { movieId },
    select: { watchlistId: true },
    // no pagination here — we need ALL matching watchlist IDs
  }).then(results => results.map(r => r.watchlistId));

  if (watchlistIds.length === 0) {
    return {
      watchlists: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

    // ── Then fetch paginated watchlists + total count ──
    const [watchlists, total] = await Promise.all([
      prisma.watchlist.findMany({
        where: {
          id: { in: watchlistIds },
        },
        skip,
        take: limit,
        // optional: add ordering
        orderBy: { createdAt: 'desc' }, // or updatedAt, name, etc.
        // optional: include relations if needed
        // include: { movies: true, user: true },
      }),

      prisma.watchlist.count({
        where: {
          id: { in: watchlistIds },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      watchlists,
      total,
      page,
      limit,
      totalPages,
    };
  }

}
