// src/repositories/watchlist.repository.ts
import { prisma } from "../config/db";
import { Prisma, Watchlist } from "../generated/prisma/client";
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
}