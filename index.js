const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const connectToMongo = require('./db');
const createRateLimiter = require('./middleware/rateLimiter');

require('dotenv').config();

connectToMongo();

const whitelist = process.env.FRONTEND_HOST || 'http://localhost:3000';
const corsOptionsDelegate = function (req, callback) {
  let corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
}

app.use(cors(corsOptionsDelegate));
app.use(express.json());
mongoose.set('strictQuery', false);


// Specific rate limiter for '/api/auth' with a different configuration
const authRateLimiter = createRateLimiter(1, 5, "You have exceeded your 5 requests per minute limit for authentication.");
app.use('/api/auth', authRateLimiter);
app.use('/api/auth', require('./routes/auth'));

// Specific rate limiter for '/api/notes' with a different configuration
const notesRateLimiter = createRateLimiter(1, 10, "You have exceeded your 10 requests per minute limit for notes operations.");
app.use('/api/notes', notesRateLimiter);
app.use('/api/notes', require('./routes/notes'));

app.get('/', (req, res) => {
  res.send("We are connected to localhost");
});

const port = process.env.PORT || 3030;

app.listen(port, () => {
  console.log(`Backend app started on ${port}`);
});
