const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../app');
const server = require('../../../server');
const bcrypt = require('bcryptjs');
const User = require('../../../models/User');

describe('POST /api/v1/auth/sendotp',()=>{
  let user;

    //before test, create a user for testing 401
    beforeAll(async () => {
      // Connect to your database here
      await mongoose.connect(process.env.MONGO_URL);
      const fakeSalt = await bcrypt.genSalt();
      const hashPass = await bcrypt.hash("Password", fakeSalt)
      const newUser = new User({name : "Tester", email : "testuser@gmail.com", password: hashPass});
      await newUser.save();
      user = newUser;
    });

    //after tests, delete the user and discon
    afterAll(async () => {
      await user.remove();
      await mongoose.connection.close();
      server.close(); 
    });
    
    it('sends OTP successfully', async()=>{
      const response = await request(app)
      .post('/api/v1/auth/sendotp')
      .send({
        email : 'somebody.someone@gmail.com'
      });
      expect(response.status).toBe(200);
    });
    it('returns 401 as email is taken', async()=>{
      const response = await request(app)
      .post('/api/v1/auth/sendotp')
      .send({
        email : 'testuser@gmail.com'
      });
      expect(response.status).toBe(401);
    });
    it('returns 400 as email is mandatory', async()=>{
      const response = await request(app)
      .post('/api/v1/auth/sendotp')
      .send({
        email : ''
      });
      expect(response.status).toBe(400);
    });
  });