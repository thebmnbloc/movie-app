// src/services/user.service.ts
import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/userRepository";

const userRepo = new UserRepository(); // or inject via constructor in larger apps

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
  async createUser(data: CreateUserInput) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return userRepo.create({
      ...data,
      password: hashedPassword,
    });
  }

  async getUserById(id: string) {
    return userRepo.findById(id);
  }

  async getUserByEmail(email: string) {
    return userRepo.findByEmail(email);
  }

  async getUserByUsername(username: string) {
    return userRepo.findByUsername(username);
  }

  async updateUser(id: string, data: UpdateUserInput) {
    let updateData = { ...data };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return userRepo.update(id, updateData);
  }

  async deleteUser(id: string) {
    return userRepo.delete(id);
  }

  async getUserStats(id: string) {
    const [watchlistCount, reviewCount, watchHistoryCount, avgRating] = await Promise.all([
      userRepo.countWatchlists(id),
      userRepo.countReviews(id),
      userRepo.countWatchHistory(id),
      userRepo.getAverageRating(id),
    ]);

    return {
      watchlistCount,
      reviewCount,
      watchHistoryCount,
      averageRatingGiven: avgRating,
    };
  }
}