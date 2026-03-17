// src/services/authService.ts
import { AuthRepository } from '../repositories/authRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXP = '15m';
const REFRESH_EXP = '7d';

export class AuthService {
  private repo: AuthRepository;

  constructor() {
    this.repo = new AuthRepository(); // or inject later
  }

  async register(data: { email: string; username?: string; password: string }) {
    const existing = await this.repo.findUserByEmail(data.email);
    if (existing) throw new Error('Email already in use');

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await this.repo.createUser({
      email: data.email,
      username: data.username,
      passwordHash,
    });

    return this.generateTokens(user.id);
  }

  async login(email: string, password: string) {
    const user = await this.repo.findUserByEmail(email);
    if (!user || !user.password) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid credentials');

    return this.generateTokens(user.id);
  }

  async refresh(refreshToken: string) {
    const hashed = this.hashToken(refreshToken);

    const tokenRecord = await this.repo.findRefreshToken(hashed);
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    // Rotation: revoke old, issue new
    await this.repo.revokeRefreshToken(hashed);

    return this.generateTokens(tokenRecord.userId);
  }

  async logout(refreshToken: string) {
    const hashed = this.hashToken(refreshToken);
    await this.repo.revokeRefreshToken(hashed);
  }

  async logoutAll(userId: string) {
    await this.repo.revokeAllUserRefreshTokens(userId);
  }

  private generateTokens(userId: string) {
    const accessToken = jwt.sign({ sub: userId }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_EXP });

    const refreshToken = randomBytes(32).toString('hex');
    const hashedRefresh = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    this.repo.storeRefreshToken(userId, hashedRefresh, expiresAt);

    return { accessToken, refreshToken };
  }

  private hashToken(token: string) {
    return jwt.sign({ token }, REFRESH_TOKEN_SECRET).split('.')[2]; // simple hash — or use bcrypt
  }

  // Helper for middleware
  verifyAccessToken(token: string) {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as { sub: string };
  }
}