// src/repositories/movie.repository.ts
import { prisma } from "../config/db";
import { Prisma, Movie } from "@prisma/client";

// Reusable select/include types (helps with consistency & type safety)
type MovieBasicInclude = {
  genres: true;
  _count?: {
    select: {
      reviews?: true;
      watchlists?: true;
    };
  };
};

type MovieDetailInclude = {
  genres: true;
  cast?: {
    include: {
      // adjust based on your actual CastMember model
      person?: true;
    };
    orderBy: { order: "asc" };
  };
  reviews?: {
    select: {
      id: true;
      rating: true;
      content: true;
      isSpoiler: true;
      createdAt: true;
      user: {
        select: {
          id: true;
          username: true;
          avatar: true;
        };
      };
    };
    orderBy: { createdAt: "desc" };
    take: 10;
  };
  _count: {
    select: {
      reviews: true;
      watchlists: true;
    };
  };
};

export class MovieRepository {
  async create(data: {
    tmdbId?: string;
    title: string;
    overview: string;
    tagline?: string;
    posterUrl?: string;
    backdropUrl?: string;
    trailerUrl?: string;
    releaseDate?: Date;
    runtime?: number;
    budget?: number;
    revenue?: number;
    slug: string;
    genres?: { connect: { id: string }[] };
  }) {
    return prisma.movie.create({
      data,
      include: {
        genres: true,
        _count: { select: { reviews: true } },
      } as MovieBasicInclude,
    });
  }

  async findById(id: string) {
    return prisma.movie.findUnique({
      where: { id },
      include: {
        genres: true,
        cast: {
          include: {
            // adjust according to your schema (e.g. person, role)
          },
          orderBy: { order: "asc" },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            content: true,
            isSpoiler: true,
            createdAt: true,
            user: { select: { id: true, username: true, avatar: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { reviews: true, watchlists: true } },
      } as MovieDetailInclude,
    });
  }

  async findBySlug(slug: string) {
    return prisma.movie.findUnique({
      where: { slug },
      include: {
        genres: true,
        _count: { select: { reviews: true } },
      } as MovieBasicInclude,
    });
  }

  async findMany(params: {
    where: Prisma.MovieWhereInput;
    orderBy: Prisma.MovieOrderByWithRelationInput;
    skip: number;
    take: number;
  }) {
    const { where, orderBy, skip, take } = params;

    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          genres: true,
          _count: { select: { reviews: true } },
        } as MovieBasicInclude,
      }),
      prisma.movie.count({ where }),
    ]);

    return { movies, total };
  }

  async update(id: string, data: {
    tmdbId?: string;
    title?: string;
    overview?: string;
    tagline?: string;
    posterUrl?: string;
    backdropUrl?: string;
    trailerUrl?: string;
    releaseDate?: Date;
    runtime?: number;
    budget?: number;
    revenue?: number;
    rating?: number;
    genres?: { set: []; connect: { id: string }[] } | undefined;
  }) {
    return prisma.movie.update({
      where: { id },
      data,
      include: { genres: true },
    });
  }

  async delete(id: string) {
    return prisma.movie.delete({ where: { id } });
  }

  async getStats(id: string) {
    const [reviewStats, watchlistCount, watchHistoryCount] = await Promise.all([
      prisma.review.aggregate({
        where: { movieId: id },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      prisma.watchlistMovie.count({ where: { movieId: id } }),
      prisma.watchHistory.count({ where: { movieId: id } }),
    ]);

    return {
      reviewStats,
      watchlistCount,
      watchHistoryCount,
    };
  }

  async getTrending(limit = 10) {
    return prisma.movie.findMany({
      orderBy: {
        watchlists: { _count: "desc" },
      },
      take: limit,
      include: {
        genres: true,
        _count: { select: { reviews: true } },
      } as MovieBasicInclude,
    });
  }
}