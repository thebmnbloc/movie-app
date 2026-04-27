// src/controllers/authController.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/authService';


export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async register(req: Request, res: Response) {
    try {
      const { email, username, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const tokens = await this.authService.register({ email, username, password });
      res.status(201).json(tokens);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const tokens = await this.authService.login(email, password);
      res.json(tokens);
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

      const tokens = await this.authService.refresh(refreshToken);
      res.json(tokens);
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await this.authService.logout(refreshToken);
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Optional: logout from all devices (protected)
  async logoutAll(req: Request, res: Response) {
    try {
      if (!req.user?.id) throw new Error('Not authenticated');
      await this.authService.logoutAll(req.user.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
}