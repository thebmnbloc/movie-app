// src/controllers/movie.controller.ts
import { Request, Response } from "express";
import { MovieService } from "../services/movieService";


export class MovieController {
  private movieService: MovieService;

  constructor(movieService: MovieService) {
    this.movieService = movieService;
  }

  async createMovie(req: Request, res: Response) {
    try {
      const movie = await this.movieService.createMovie(req.body);
      res.status(201).json(movie);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getMovieById(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const movie = await this.movieService.getMovieById(id);
      if (!movie) return res.status(404).json({ error: "Movie not found" });
      res.json(movie);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async getMovieBySlug(req: Request<{ slug: string }>, res: Response) {
    try {
      const { slug } = req.params;
      const movie = await this.movieService.getMovieBySlug(slug);
      if (!movie) return res.status(404).json({ error: "Movie not found" });
      res.json(movie);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async getMovies(req: Request, res: Response) {
    try {
      // You can add query validation (zod/joi) here later
      const filters = req.query as any; // in real app → parse & validate
      const result = await this.movieService.getMovies(filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async updateMovie(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const updated = await this.movieService.updateMovie(id, req.body);
      if (!updated) return res.status(404).json({ error: "Movie not found" });
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async deleteMovie(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      await this.movieService.deleteMovie(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async getMovieStats(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const stats = await this.movieService.getMovieStats(id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async getTrendingMovies(req: Request, res: Response) {
    try {
      const limit = Number(req.query.limit) || 10;
      const movies = await this.movieService.getTrendingMovies(limit);
      res.json(movies);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
}


/*
// Types
interface CreateMovieInput {
  tmdbId?: string
  title: string
  overview: string
  tagline?: string
  posterUrl?: string
  backdropUrl?: string
  trailerUrl?: string
  releaseDate?: Date
  runtime?: number
  budget?: number
  revenue?: number
  genreIds?: string[]
}

interface UpdateMovieInput extends Partial<CreateMovieInput> {
  rating?: number
}

interface MovieFilters {
  search?: string
  genre?: string
  minRating?: number
  maxRating?: number
  yearFrom?: number
  yearTo?: number
  sortBy?: 'rating' | 'releaseDate' | 'title' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// CREATE
export async function createMovie(data: CreateMovieInput) {
  const { genreIds, ...movieData } = data
  
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return prisma.movie.create({
    data: {
      ...movieData,
      slug: `${slug}-${Date.now()}`,
      genres: genreIds ? {
        connect: genreIds.map(id => ({ id })),
      } : undefined,
    },
    include: {
      genres: true,
      _count: {
        select: { reviews: true },
      },
    },
  })
}

// READ
export async function getMovieById(id: string) {
  return prisma.movie.findUnique({
    where: { id },
    include: {
      genres: true,
      cast: {
        include: {
          // Note: You'd need to adjust based on your actual CastMember relation
        },
        orderBy: { order: 'asc' },
      },
      reviews: {
        select: {
          id: true,
          rating: true,
          content: true,
          isSpoiler: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: {
          reviews: true,
          watchlists: true,
        },
      },
    },
  })
}

export async function getMovieBySlug(slug: string) {
  return prisma.movie.findUnique({
    where: { slug },
    include: {
      genres: true,
      _count: {
        select: { reviews: true },
      },
    },
  })
}

export async function getMovies(filters: MovieFilters = {}) {
  const {
    search,
    genre,
    minRating,
    maxRating,
    yearFrom,
    yearTo,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 20,
  } = filters

  const where: any = {}

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { overview: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (genre) {
    where.genres = {
      some: {
        name: { equals: genre, mode: 'insensitive' },
      },
    }
  }

  if (minRating !== undefined || maxRating !== undefined) {
    where.rating = {}
    if (minRating !== undefined) where.rating.gte = minRating
    if (maxRating !== undefined) where.rating.lte = maxRating
  }

  if (yearFrom !== undefined || yearTo !== undefined) {
    where.releaseDate = {}
    if (yearFrom !== undefined) {
      where.releaseDate.gte = new Date(`${yearFrom}-01-01`)
    }
    if (yearTo !== undefined) {
      where.releaseDate.lte = new Date(`${yearTo}-12-31`)
    }
  }

  const skip = (page - 1) * limit

  const [movies, total] = await Promise.all([
    prisma.movie.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      include: {
        genres: true,
        _count: {
          select: { reviews: true },
        },
      },
    }),
    prisma.movie.count({ where }),
  ])

  return {
    movies,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// UPDATE
export async function updateMovie(id: string, data: UpdateMovieInput) {
  const { genreIds, ...movieData } = data

  return prisma.movie.update({
    where: { id },
    data: {
      ...movieData,
      genres: genreIds ? {
        set: [], // Clear existing
        connect: genreIds.map(id => ({ id })),
      } : undefined,
    },
    include: {
      genres: true,
    },
  })
}

// DELETE
export async function deleteMovie(id: string) {
  return prisma.movie.delete({
    where: { id },
  })
}

// Movie Stats
export async function getMovieStats(id: string) {
  const [reviewStats, watchlistCount, watchHistoryCount] = await Promise.all([
    prisma.review.aggregate({
      where: { movieId: id },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.watchlistMovie.count({ where: { movieId: id } }),
    prisma.watchHistory.count({ where: { movieId: id } }),
  ])

  return {
    averageRating: reviewStats._avg.rating,
    reviewCount: reviewStats._count.rating,
    watchlistCount,
    watchHistoryCount,
  }
}

// Trending Movies (most added to watchlists recently)
export async function getTrendingMovies(limit = 10) {
  return prisma.movie.findMany({
    orderBy: {
      watchlists: {
        _count: 'desc',
      },
    },
    take: limit,
    include: {
      genres: true,
      _count: {
        select: { reviews: true },
      },
    },
  })
}


  // You can add more movie-related handlers here, such as:
  - getMovies
  - createMovie
  - updateMovie
  - deleteMovie
*/
