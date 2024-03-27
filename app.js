require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const createRateLimiter = require('./middleware/rateLimiter');

const mongoose = require('mongoose');
const connectToMongo = require('./db');
const errorHandler = require('./middleware/errorHandler');

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
const authRateLimiter = createRateLimiter(1, 500, "You have exceeded your 5 requests per minute limit for authentication.");
app.use('/api/v1/auth', authRateLimiter);
app.use('/api/v1/auth', require('./routes/auth'));

// Specific rate limiter for '/api/notes' with a different configuration
const notesRateLimiter = createRateLimiter(1, 20, "You have exceeded your 20 requests per minute limit for notes operations.");
app.use('/api/v1/notes', notesRateLimiter);
app.use('/api/v1/notes', require('./routes/notes'));

// Global error handling middleware
app.use(errorHandler);


module.exports = app;
