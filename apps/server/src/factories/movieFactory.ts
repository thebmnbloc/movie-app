/*
import { MovieRepository } from '../repositories/movieRepository';
import { MovieService } from '../services/movieService';
import { MovieController } from '../controllers/movieController';

export const createMovieController = (): MovieController => {
  const repository = new MovieRepository();
  const service = new MovieService(repository);
  const controller = new MovieController(service);

  // Optional: Auto-bind all methods here if you don't want .bind() in routes
  // controller.createMovie = controller.createMovie.bind(controller);
  // ... or do it inside the MovieController constructor

  return controller;
};

*/