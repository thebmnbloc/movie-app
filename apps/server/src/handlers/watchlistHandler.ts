
import { Request, Response, NextFunction } from 'express';

function watchlistHandler(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json({
      success: true,
      message: 'Watchlist handler is working!'
    });
  } catch (error) {
    next(error);
  }
}

export default watchlistHandler;