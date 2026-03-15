import express from 'express';
import { config } from "dotenv";
import { connectToDatabase } from "./config/db";

// import movieRoute
import movieRoute from "./routes/movieRoute"
import userRoute from "./routes/userRoute"
import watchlistRoute from "./routes/watchlistRoute"

config();
connectToDatabase();

const app = express();

const PORT = 3000;

// body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Movie API!'
  });
});

// API routes
app.use('/movies', movieRoute);
app.use('/user', userRoute);
app.use('/watchlist', watchlistRoute);



// app running on localhost
app.listen(PORT, ()=> {
  console.log(`Server is running on http://localhost:${PORT}`)
});