// src/services/movie.service.ts
import { MovieRepository } from "../repositories/movieRepository";

// const movieRepo = new MovieRepository(); // or inject via constructor

// Reuse your original interfaces
interface CreateMovieInput {
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
  genreIds?: string[];
}

interface UpdateMovieInput extends Partial<CreateMovieInput> {
  rating?: number;
}

interface MovieFilters {
  search?: string;
  genre?: string;
  minRating?: number;
  maxRating?: number;
  yearFrom?: number;
  yearTo?: number;
  sortBy?: "rating" | "releaseDate" | "title" | "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export class MovieService {
  private movieRepo: MovieRepository;

  constructor(movieRepo: MovieRepository) {
    this.movieRepo = movieRepo;
  }

  async createMovie(input: CreateMovieInput) {
    const { genreIds, ...movieData } = input;

    const baseSlug = input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const slug = `${baseSlug}-${Date.now()}`;

    return this.movieRepo.create({
      ...movieData,
      slug,
      genres: genreIds ? { connect: genreIds.map((id) => ({ id })) } : undefined,
    });
  }

  async getMovieById(id: string) {
    return this.movieRepo.findById(id);
  }

  async getMovieBySlug(slug: string) {
    return this.movieRepo.findBySlug(slug);
  }

  async getMovies(filters: MovieFilters = {}) {
    const {
      search,
      genre,
      minRating,
      maxRating,
      yearFrom,
      yearTo,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = filters;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { overview: { contains: search, mode: "insensitive" } },
      ];
    }

    if (genre) {
      where.genres = { some: { name: { equals: genre, mode: "insensitive" } } };
    }

    if (minRating !== undefined || maxRating !== undefined) {
      where.rating = {};
      if (minRating !== undefined) where.rating.gte = minRating;
      if (maxRating !== undefined) where.rating.lte = maxRating;
    }

    if (yearFrom !== undefined || yearTo !== undefined) {
      where.releaseDate = {};
      if (yearFrom !== undefined) {
        where.releaseDate.gte = new Date(`${yearFrom}-01-01`);
      }
      if (yearTo !== undefined) {
        where.releaseDate.lte = new Date(`${yearTo}-12-31`);
      }
    }

    const skip = (page - 1) * limit;

    const { movies, total } = await this.movieRepo.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    return {
      movies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateMovie(id: string, input: UpdateMovieInput) {
    const { genreIds, ...movieData } = input;

    return this.movieRepo.update(id, {
      ...movieData,
      genres: genreIds
        ? {
            set: [], // disconnect existing
            connect: genreIds.map((id) => ({ id })),
          }
        : undefined,
    });
  }

  async deleteMovie(id: string) {
    return this.movieRepo.delete(id);
  }

  async getMovieStats(id: string) {
    const { reviewStats, watchlistCount, watchHistoryCount } =
      await this.movieRepo.getStats(id);

    return {
      averageRating: reviewStats._avg.rating,
      reviewCount: reviewStats._count.rating,
      watchlistCount,
      watchHistoryCount,
    };
  }

  async getTrendingMovies(limit = 10) {
    return this.movieRepo.getTrending(limit);
  }
}