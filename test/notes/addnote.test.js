const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../app'); // path to your index file
const server = require('../../../server');
const User = require('../../../models/User');
const bcrypt = require('bcryptjs');
const Notes = require('../../../models/Notes');


describe('POST /api/v1/notes/add', () => {
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

  it('it creates a new note', async () => {
    const response = await request(app)
      .post('/api/v1/notes/add')
      .set('auth-token', token)
      .send({
        title:"Test Note",
        description: "This note was created by the test",
        tag: "Jest , Supertest"
      });
      createdNote = response.body;

    expect(response.status).toBe(201);
    expect(typeof response.body).toBe('object');  
    
  });
  it('it returns 400 bad request for invalid input', async () => {
    const response = await request(app)
      .post('/api/v1/notes/add')
      .set('auth-token', token)
      .send({
        title:"",
        description: "This note was created by the test",
        tag: "Jest , Supertest"
      });

    expect(response.status).toBe(400);
    
  });

  it('it returns 401 due to invalid token', async () => {
    const response = await request(app)
      .post('/api/v1/notes/add')
      .set('auth-token', 'dhsfiuahoisdhfaosidf') //fake jwt 
      .send({
        title:"Test Note",
        description: "This note was created by the test",
        tag: "Jest , Supertest"
      });

    expect(response.status).toBe(401);
  });

  //after tests, delete the user, note and end the connection
  afterAll(async () => {
    await user.remove();
    await Notes.findByIdAndDelete(createdNote?._id);
    await mongoose.connection.close();
    server.close(); 
  });
});
