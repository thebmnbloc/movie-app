import { prisma } from "../config/db";
import bcrypt from 'bcrypt';

// Types
interface CreateUserInput {
  email: string
  username: string
  password: string
  avatar?: string
  bio?: string
}

interface UpdateUserInput {
  email?: string
  username?: string
  avatar?: string
  bio?: string
  password?: string
}

// CREATE
export async function createUser(data: CreateUserInput) {
  const hashedPassword = await bcrypt.hash(data.password, 10)
  
  return prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      username: true,
      avatar: true,
      bio: true,
      createdAt: true,
    },
  })
}

// READ
export async function getUserById(id: string) {
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
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}

export async function getUserByUsername(username: string) {
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
          _count: {
            select: { movies: true },
          },
        },
      },
      reviews: {
        select: {
          id: true,
          rating: true,
          content: true,
          createdAt: true,
          movie: {
            select: {
              id: true,
              title: true,
              posterUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })
}

// UPDATE
export async function updateUser(id: string, data: UpdateUserInput) {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10)
  }

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
  })
}

// DELETE
export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
  })
}

// User Stats
export async function getUserStats(id: string) {
  const [watchlistCount, reviewCount, watchHistoryCount] = await Promise.all([
    prisma.watchlist.count({ where: { userId: id } }),
    prisma.review.count({ where: { userId: id } }),
    prisma.watchHistory.count({ where: { userId: id } }),
  ])

  const avgRating = await prisma.review.aggregate({
    where: { userId: id },
    _avg: { rating: true },
  })

  return {
    watchlistCount,
    reviewCount,
    watchHistoryCount,
    averageRatingGiven: avgRating._avg.rating,
  }
}