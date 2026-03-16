// src/repositories/user.repository.ts
import { prisma } from "../config/db";
import { Prisma, User } from "../generated/prisma/client";

// Types (you can move these to a shared types file later)
export type UserSelectBasic = {
  id: true;
  email: true;
  username: true;
  avatar: true;
  bio: true;
  createdAt: true;
  updatedAt?: true;
};

export type UserWithPublicWatchlistsAndRecentReviews = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    avatar: true;
    bio: true;
    watchlists: {
      where: { isPublic: true };
      select: {
        id: true;
        name: true;
        description: true;
        _count: { select: { movies: true } };
      };
    };
    reviews: {
      select: {
        id: true;
        rating: true;
        content: true;
        createdAt: true;
        movie: { select: { id: true; title: true; posterUrl: true } };
      };
      orderBy: { createdAt: "desc" };
      take: 5;
    };
  };
}>;

export class UserRepository {
  async create(data: {
    email: string;
    username: string;
    password: string;
    avatar?: string;
    bio?: string;
  }): Promise<Pick<User, "id" | "email" | "username" | "avatar" | "bio" | "createdAt">> {
    return prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        bio: true,
        createdAt: true,
      },
    });
  }

  async findById(
    id: string,
  ): Promise<Pick<User, "id" | "email" | "username" | "avatar" | "bio" | "createdAt"> & {
    _count: { watchlists: number; reviews: number };
  } | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            watchlists: true,
            reviews: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(
    username: string,
  ): Promise<UserWithPublicWatchlistsAndRecentReviews | null> {
    return prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        watchlists: {
          where: { isPublic: true },
          select: {
            id: true,
            name: true,
            description: true,
            _count: { select: { movies: true } },
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            content: true,
            createdAt: true,
            movie: { select: { id: true, title: true, posterUrl: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      email: string;
      username: string;
      avatar: string;
      bio: string;
      password: string;
    }>,
  ): Promise<Pick<User, "id" | "email" | "username" | "avatar" | "bio" | "updatedAt"> | null> {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        bio: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({ where: { id } });
  }

  // Stats helpers (pure data)
  async countWatchlists(userId: string): Promise<number> {
    return prisma.watchlist.count({ where: { userId } });
  }

  async countReviews(userId: string): Promise<number> {
    return prisma.review.count({ where: { userId } });
  }

  async countWatchHistory(userId: string): Promise<number> {
    return prisma.watchHistory.count({ where: { userId } });
  }

  async getAverageRating(userId: string): Promise<number | null> {
    const result = await prisma.review.aggregate({
      where: { userId },
      _avg: { rating: true },
    });
    return result._avg.rating;
  }
}