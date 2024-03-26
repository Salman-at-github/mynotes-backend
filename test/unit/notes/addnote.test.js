const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../app'); // path to your index file
const server = require('../../../server');

describe('POST /api/v1/notes/add', () => {
  let token;
  let createdNote;

  //before tests, get the authtoken from login api
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

  //after tests, delete the note and end the connection
  afterAll(async () => {
    //delete the created note after test
    await request(app)
      .delete(`/api/v1/notes/delete/${createdNote?._id}`)
      .set('auth-token', token)
    await mongoose.connection.close();
    server.close(); 
  });
});
