const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../app')
const server = require('../../../server');
const OTPModel = require('../../../models/OTP');
const User = require('../../../models/User');
describe('POST /api/v1/auth/signup', () => {

  let otpDoc;
  let user;

  //before signup, create an otp doc with verifired True for signup
    beforeAll(async () => {
      // Connect to your database here
      await mongoose.connect(process.env.MONGO_URL);
      const createOTP = await new OTPModel({
        email: "testuser@gmail.com",
        OTP:"123123",
        verified: true
      });

      createOTP.save();
      otpDoc = createOTP;
    });
  
    //after tests, remove the otpDoc, delete user and discon
    afterAll(async () => {
      await otpDoc.remove();
      await User.findByIdAndDelete(user._id);
      await mongoose.connection.close();
      server.close(); 
    });
  
    it('it should sign the user up successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({name : "Tester",
          email: 'testuser@gmail.com',
          password: 'Password'
        });
      
      user = response.body.user; //set user

      expect(response.status).toBe(201);
      expect(typeof response.body).toBe('object');
      expect(response.body.success).toEqual(true);
    });
  
    it('it should return 409 user exists', async()=>{
      const response = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        name: "Tester",
        email : "testuser@gmail.com", 
        password : "Password "
      });
      expect(response.status).toBe(409);
    })
    it('it should return 401 OTP not sent/verified', async()=>{
      const response = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        name: "James",
        email : "newemail@gmail.com", //unverified email
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