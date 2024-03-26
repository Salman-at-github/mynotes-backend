const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../app'); // path to your index file
const server = require('../../../server');

describe('DELETE /api/v1/notes/delete/:id', () => {
  let token;
  let createdNote;

  //before test, fetch auth token and create a note
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

    const noteResponse = await request(app)
    .post('/api/v1/notes/add')
    .set('auth-token', token)
    .send({
        title:"Test Note",
        description: "This note was created by the test",
        tag: "Jest , Supertest"
      });
      createdNote = noteResponse.body;
  });

  afterAll(async () => {
    await mongoose.connection.close();
    server.close(); 
  });

  it('it deletes a note', async () => {
    const response = await request(app)
    .delete(`/api/v1/notes/delete/${createdNote?._id}`)
    .set('auth-token', token)

    expect(response.status).toBe(200);
    expect(typeof response.body).toBe('object');  
    
  });

  it('it returns 401 due to invalid token', async () => {
    const fakeToken = "asdhfisad"
    const response = await request(app)
    .delete(`/api/v1/notes/delete/${createdNote?._id}`)
    .set('auth-token', fakeToken)

    expect(response.status).toBe(401);
  });
  it('it returns 404 note not found', async () => {
    const fakeID = "124e15360b1e2877203c4d29" //incorrect note ID
    const response = await request(app)
      .delete(`/api/v1/notes/delete/${fakeID}`)
      .set('auth-token', token) 


    expect(response.status).toBe(404);
  });

});
