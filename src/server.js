import express from 'express';
import { config } from "dotenv"
import { connectDB, disconnectDB } from './config/db.js';

// import movieRoute
import movieRoute from "./routes/movieRoute.js"

config();
connectDB()

const app = express();

const PORT = 3000;

// body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// API routes
app.use('/movies', movieRoute);
app.use('/users', userRoute);
app.use('/watchlist', watchlistRoute);



// app running on localhost
app.listen(PORT, ()=> {
  console.log('Server is running on ${PORT}')
});

// error hamdling
process.on("unhandledRejection", (err)=>{
  console.err("unhandled Rejection:", err);
  server.close( async (err)=> {
    await disconnectDB();
    process.exit(1);
  })
})

process.on("uncaughtException", async (err)=> {
  console.err("uncaught Exception:", err);
  await disconnectDB()
  process.exit(1)
})