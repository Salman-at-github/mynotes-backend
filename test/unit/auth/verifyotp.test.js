const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../app')
const server = require('../../../server')

describe('POST /api/v1/auth/verifyotp',()=>{

    beforeAll(async () => {
      // Connect to your database here
      await mongoose.connect(process.env.MONGO_URL);
    });
  
    afterAll(async () => {
      await mongoose.connection.close();
      server.close(); 
    });
    
    it('verifies OTP successfully', async()=>{
      const response = await request(app)
      .post('/api/v1/auth/verifyotp')
      .send({
        email : 'ryostyles.114433@gmail.com',
        OTP:"087880" //need to enter the received otp
      });
      expect(response.status).toBe(200);
    });
    it('returns 404 as OTP not sent', async()=>{
      const response = await request(app)
      .post('/api/v1/auth/verifyotp')
      .send({
        email : 'someemail@gmail.com',
        OTP:"000000"
      });
      expect(response.status).toBe(404);
    });
    it('returns 401 as incorrect OTP', async()=>{
      const response = await request(app)
      .post('/api/v1/auth/verifyotp')
      .send({
        email : 'ryostyles.114433@gmail.com',
        OTP:"000000"
      });
      expect(response.status).toBe(401);
    });
  });