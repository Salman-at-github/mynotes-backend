const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../app')
const server = require('../../../server')
describe('POST /api/v1/auth/signup', () => {
    beforeAll(async () => {
      // Connect to your database here
      await mongoose.connect(process.env.MONGO_URL);
    });
  
    afterAll(async () => {
      await mongoose.connection.close();
      server.close(); 
    });
  
    it.skip('it should sign the user up', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({name : "Ryooo",
          email: 'ryostyles.114433@gmail.com',
          password: 'Password'
        });
  
      expect(response.status).toBe(201);
      expect(typeof response.body).toBe('object');
      expect(response.body.success).toEqual(true);
    });
  
    it('it should return 409 user exists', async()=>{
      const response = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        name: "James",
        email : "salmankps2001@gmail.com", 
        password : "Whatever "
      });
      expect(response.status).toBe(409);
    })
    it('it should return 401 OTP not sent/verified', async()=>{
      const response = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        name: "James",
        email : "newemail@gmail.com", 
        password : "Whatever here"
      });
      expect(response.status).toBe(401);
    })
    it('it should return 400 bad request when bad input', async()=>{
      const response = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        name: "",
        email : "newemailcom", 
        password : "Whatever here"
      });
      expect(response.status).toBe(400);
    })
  });