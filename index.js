const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const connectToMongo = require('./db');

require('dotenv').config();

connectToMongo();

// Read allowed origins from environment variable
const frontendHosts = process.env.FRONTEND_HOST || 'http://localhost:3000';

// Split the comma-separated string into an array
const whitelist = frontendHosts.split(',');
console.log(whitelist)

// // Configure CORS options
// const corsOptions = {
//   origin: (origin, callback) => {
//     if (whitelist.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
// };

const corsOptionsDelegate = function (req, callback) {
  let corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}

app.use(cors(corsOptionsDelegate));
app.use(express.json());
mongoose.set('strictQuery', true);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notesroute'));

app.get('/', (req, res) => {
  res.send("We are connected to localhost");
});

const port = process.env.PORT || 3030;

app.listen(port, () => {
  console.log(`Backend app started on ${port}`);
});
