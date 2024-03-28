const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../app'); // path to your index file
const server = require('../../../server');
const User = require('../../../models/User');
const bcrypt = require('bcryptjs');
const Notes = require('../../../models/Notes');


describe('GET /api/v1/notes/get', () => {
  let user;
  let token;
  let createdNote;

  //before tests,create a user, login, get the authtoken from login api
  beforeAll(async () => {
    // Connect to your database here
    await mongoose.connect(process.env.MONGO_URL);

    const fakeSalt = await bcrypt.genSalt();
    const hashPass = await bcrypt.hash("Password", fakeSalt)
    const newUser = new User({name : "Tester", email : "testuser@gmail.com", password: hashPass});
    await newUser.save();
    user = newUser;
    // Log in the test user to get a JWT token
    const loginResponse = await request(app)
      .post('/api/v1/auth/signin')
      .send({ email: 'testuser@gmail.com', password: 'Password' });

    // Save the JWT token
    token = loginResponse.body.authtoken;
  });
//after tests, delete the user, note and end the connection
afterAll(async () => {
  await user.remove();
  await Notes.findByIdAndDelete(createdNote?._id);
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
