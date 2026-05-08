// src/services/user.service.ts
import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/userRepository";

// const userRepo = new UserRepository(); // or inject via constructor in larger apps

// Types (reuse or move to shared)
interface CreateUserInput {
  email: string;
  username: string;
  password: string;
  avatar?: string;
  bio?: string;
}

interface UpdateUserInput {
  email?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  password?: string;
}

export class UserService {
  private userRepo: UserRepository;

  constructor(userRepo: UserRepository) {
    this.userRepo = userRepo;
  }

  async createUser(data: CreateUserInput) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.userRepo.create({
      ...data,
      password: hashedPassword,
    });
  }

  async getUserById(id: string) {
    return this.userRepo.findById(id);
  }

  async getUserByEmail(email: string) {
    return this.userRepo.findByEmail(email);
  }

  async getUserByUsername(username: string) {
    return this.userRepo.findByUsername(username);
  }

  async updateUser(id: string, data: UpdateUserInput) {
    let updateData = { ...data };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return this.userRepo.update(id, updateData);
  }

  async deleteUser(id: string) {
    return this.userRepo.delete(id);
  }

  async getUserStats(id: string) {
    const [watchlistCount, reviewCount, watchHistoryCount, avgRating] = await Promise.all([
      this.userRepo.countWatchlists(id),
      this.userRepo.countReviews(id),
      this.userRepo.countWatchHistory(id),
      this.userRepo.getAverageRating(id),
    ]);

    return {
      watchlistCount,
      reviewCount,
      watchHistoryCount,
      averageRatingGiven: avgRating,
    };
  }

   async getUsers(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    return this.userRepo.findAll(offset, limit);
  }
}