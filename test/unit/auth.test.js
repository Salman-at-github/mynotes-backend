const request = require('supertest');
const app = require('../../app'); // path to your index file
const server = require('../../server')
const mongoose = require('mongoose');

describe('POST /api/v1/auth/signin', () => {
  beforeAll(async () => {
    // Connect to your database here
    await mongoose.connect(process.env.MONGO_URL);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    server.close(); 
  });

  it('it should log in the user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/signin')
      .send({
        email: 'salmankps2001@gmail.com',
        password: 'Password'
      });

    expect(response.status).toBe(200);
    expect(typeof response.body).toBe('object');
    expect(response.body.success).toEqual(true);
    expect(response.body).toHaveProperty('authtoken');
  });

  it('it should return 404 user not found', async()=>{
    const response = await request(app)
    .post('/api/v1/auth/signin')
    .send({
      email : "Nono@gmail.com", 
      password : "Nothing here"
    });
    expect(response.status).toBe(404);
  })
  it('it should return 401 incorrect password', async()=>{
    const response = await request(app)
    .post('/api/v1/auth/signin')
    .send({
      email : "salmankps2001@gmail.com", 
      password : "Wrong pass here"
    });
    expect(response.status).toBe(401);
  })
  it('it should return 400 bad request for incorrect emai', async()=>{
    const response = await request(app)
    .post('/api/v1/auth/signin')
    .send({
      email : "noemailhere", 
      password : "Wrong pass here"
    });
    expect(response.status).toBe(400);
  })
});
