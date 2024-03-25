const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../app')
const server = require('../../../server')
describe('POST /api/v1/auth/sendotp',()=>{

    beforeAll(async () => {
      // Connect to your database here
      await mongoose.connect(process.env.MONGO_URL);
    });
  
    afterAll(async () => {
      await mongoose.connection.close();
      server.close(); 
    });
    
    it('sends OTP successfully', async()=>{
      const response = await request(app)
      .post('/api/v1/auth/sendotp')
      .send({
        email : 'ryostyles.114433@gmail.com'
      });
      expect(response.status).toBe(200);
    });
    it('returns 401 as email is taken', async()=>{
      const response = await request(app)
      .post('/api/v1/auth/sendotp')
      .send({
        email : 'salmankps2001@gmail.com'
      });
      expect(response.status).toBe(401);
    });
  });