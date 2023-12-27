require('dotenv').config();
//call and load env var
// THIS IS WHERE THE ENTIRE BACKEND IS INTEGRATED INTO A SINGLE SERVER APPLICATION
const connectToMongo = require('./db');
const cors = require('cors');

const mongoose = require('mongoose');

connectToMongo();

const express = require('express');
const app = express();


// TO USE req.body json to send data body with req 
app.use(cors());
app.use(express.json());
mongoose.set('strictQuery', true);

// AVAILABLE ROUTES (APIs)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notesroute'));
app.get('/', (req, res) => {
  res.send("We are connected to localhost")
});

const port = process.env.PORT || 3030;

app.listen(port,() => {
  console.log(`Backend app started on ${port}`);
});

