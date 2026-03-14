
import { Request, Response, NextFunction } from 'express';

function movieHandler(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json({
      success: true,
      message: 'movie handler is working!'
    });
  } catch (error) {
    next(error);
  }
}

export default movieHandler;