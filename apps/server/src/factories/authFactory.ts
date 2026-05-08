import { AuthRepository } from "../repositories/authRepository";
import { AuthService } from "../services/authService";
import { AuthController } from "../controllers/authController";

export const createAuthController = (): AuthController => {
  const repo = new AuthRepository();
  const service = new AuthService(repo);
  const controller = new AuthController(service);

  return controller;
};