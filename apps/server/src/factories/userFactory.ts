import { UserRepository } from "../repositories/userRepository";
import { UserService } from "../services/userService";
import { UserController } from "../controllers/userController";

export const createUserController = (): UserController => {
  const repo = new UserRepository();
  const service = new UserService(repo);
  const controller = new UserController(service);

  return controller;
};
