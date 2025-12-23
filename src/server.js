import express from 'express';
import movieRoute from "./routes/movieRoute.js"

const app = express();

const PORT = 3000;

app.use('/movies', movieRoute);



app.listen(PORT, ()=> {
  console.log('Server is running on ${PORT}')
});

// GET, POST, PUT, PATCH, DELETE
// http://localhost:3000/hello