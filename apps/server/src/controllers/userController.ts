// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { UserService } from '../services/userService';  // note: you had userService → fix capitalization if needed

// const userService = new UserService(); // or better: inject via constructor

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async createUser(req: Request, res: Response) {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const users = await this.userService.getUsers(page, limit);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  // ── Use generics here ──
  async getUserById(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;  // now id: string (TS knows it's present)

      const user = await this.userService.getUserById(id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  async getUserByEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (typeof email !== 'string') {
        return res.status(400).json({ error: 'Email required' });
      }

      const user = await this.userService.getUserByEmail(email);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  async getUserByUsername(req: Request, res: Response) {
    try {
      const { username } = req.body;
      if (typeof username !== 'string') {
        return res.status(400).json({ error: 'Username required' });
      }

      const user = await this.userService.getUserByUsername(username);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  // ── Again generics for params ──
  async updateUser(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      // Assuming you accept partial update data in body
      const updated = await this.userService.updateUser(id, req.body);
      if (!updated) return res.status(404).json({ error: 'User not found' });
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async deleteUser(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  async getUserStats(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const stats = await this.userService.getUserStats(id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
}