const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../app'); // path to your index file
const server = require('../../../server');

describe('GET /api/v1/notes/get', () => {
  let token;

  beforeAll(async () => {
    // Connect to your database here
    await mongoose.connect(process.env.MONGO_URL);

    // Log in the test user to get a JWT token
    const loginResponse = await request(app)
      .post('/api/v1/auth/signin')
      .send({ email: 'salmankps2001@gmail.com', password: 'Password' });

    // Save the JWT token
    console.log(loginResponse.body)
    token = loginResponse.body.authtoken;
  });

  afterAll(async () => {
    await mongoose.connection.close();
    server.close(); 
  });

  it('fetches the notes', async () => {
    const response = await request(app)
      .get('/api/v1/notes/get?page=1&?limit=10')
      .set('auth-token', token); // Include the JWT token in the request

    expect(response.status).toBe(200);
    expect(typeof response.body).toBe('object');  
    expect(response.body).toHaveProperty('results');
    expect(response.body).toHaveProperty('totalNotes');
    expect(response.body).toHaveProperty('totalPages');
    expect(response.body).toHaveProperty('currentPage');
  });

  it('it returns 401 due to invalid token', async () => {
    const response = await request(app)
      .get('/api/v1/notes/get?page=1&?limit=10')
      .set('auth-token', 'skjhfiusadhoifuhsdifghmoiudfsmhoguifdgo'); // fake jwt

    expect(response.status).toBe(401);
    expect(typeof response.body).toBe('object');  
  });


});
