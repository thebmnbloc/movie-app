// src/repositories/auth.repository.ts
import { prisma } from "../config/db"
import bcrypt from 'bcrypt';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        role: true,
      },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      },
    });
  }

  async createUser(data: { email: string; username?: string; passwordHash: string }) {
    return prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash: data.passwordHash,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async storeRefreshToken(userId: string, hashedToken: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: {
        userId,
        hashedToken,
        expiresAt,
      },
    });
  }

  async findRefreshToken(hashedToken: string) {
    return prisma.refreshToken.findFirst({
      where: { hashedToken, revokedAt: null },
      include: { user: { select: { id: true, email: true, role: true } } },
    });
  }

  async revokeRefreshToken(hashedToken: string) {
    return prisma.refreshToken.updateMany({
      where: { hashedToken },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserRefreshTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}