const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../app'); // path to your index file
const server = require('../../../server');

describe('PUT /api/v1/notes/update/:id', () => {
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

  it('it updates a note', async () => {
    const response = await request(app)
    .put(`/api/v1/notes/update/${createdNote?._id}`)
    .set('auth-token', token)
    .send({
      title:"Edited Note",
      description: "This note was edited",
      tag: "Edit, Jest , Supertest"
    })

    expect(response.status).toBe(200);
    expect(typeof response.body).toBe('object');
    
  });

  it('it returns 401 due to invalid token', async () => {
    const fakeToken = "asdhfisad"
    const response = await request(app)
    .put(`/api/v1/notes/update/${createdNote?._id}`)
    .set('auth-token', fakeToken)
    .send({
      title:"Edited Note",
      description: "This note was edited",
      tag: "Edit, Jest , Supertest"
    })

    expect(response.status).toBe(401);
  });

  it('it returns 404 note not found', async () => {
    const fakeID = "124e15360b1e2877203c4d29" //incorrect ID
    const response = await request(app)
      .put(`/api/v1/notes/update/${fakeID}`)
      .set('auth-token', token)
      .send({
        title:"Edited Note",
        description: "This note was edited",
        tag: "Edit, Jest , Supertest"
      });
      
    expect(response.status).toBe(404);
  });

  //after tests delete the note
  afterAll(async () => {
      await request(app)
      .delete(`/api/v1/notes/delete/${createdNote?._id}`)
      .set('auth-token', token)
      await mongoose.connection.close();
      server.close(); 
    });

});
