const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app')
const server = require('../../server');
const OTPModel = require('../../models/OTP');

describe('POST /api/v1/auth/verifyotp',()=>{

    let otpDoc;
    //before tests, create an otp doc
    beforeAll(async () => {
      // Connect to your database here
      await mongoose.connect(process.env.MONGO_URL);
      const createOTP = await new OTPModel({
        email: "testuser@gmail.com",
        OTP:"123123",
        verified: false
      });

      createOTP.save();
      otpDoc = createOTP;

    });
    
    //after test delete the otp doc and disc the db
    afterAll(async () => {
      await otpDoc.remove();
      await mongoose.connection.close();
      server.close(); 
    });

    it('returns 401 as incorrect OTP', async()=>{
      const response = await request(app)
      .post('/api/v1/auth/verifyotp')
      .send({
        email : 'testuser@gmail.com',
        OTP:"121212"
      });
      expect(response.status).toBe(401);
    });
    
    it('verifies OTP successfully', async()=>{
      const response = await request(app)
      .post('/api/v1/auth/verifyotp')
      .send({
        email : 'testuser@gmail.com',
        OTP:"123123" //need to enter the received otp
      });
      expect(response.status).toBe(200);
    });
    it('returns 404 as OTP not sent in the first place', async()=>{
      const response = await request(app)
      .post('/api/v1/auth/verifyotp')
      .send({
        email : 'someemail@gmail.com',
        OTP:"000000"
      });
      expect(response.status).toBe(404);
    });
    
  });