const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../app')
const server = require('../../../server');
const User = require('../../../models/User');
const bcrypt = require('bcryptjs');
describe('POST /api/v1/auth/signin', () => {
  let user;
    //before test, directly create a user in db so that we can Log that user in
    beforeAll(async () => {
      // Connect to your database here
      await mongoose.connect(process.env.MONGO_URL);

      const fakeSalt = await bcrypt.genSalt();
      const hashPass = await bcrypt.hash("Password", fakeSalt)
      const newUser = new User({name : "Tester", email : "something@gmail.com", password: hashPass});
      await newUser.save();
      user = newUser;
    });
  

    //after tests, delete the user and discon
    afterAll(async () => {
      await user.remove();
      await mongoose.connection.close();
      server.close(); 
    });
  
    it('it should log in the user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signin')
        .send({
          email: 'something@gmail.com',
          password: "Password"
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
        email : "Nono@gmail.com",  //a non existant email
        password : "Nothing here"
      });
      expect(response.status).toBe(404);
    })
    it('it should return 401 incorrect password', async()=>{
      const response = await request(app)
      .post('/api/v1/auth/signin')
      .send({
        email : "something@gmail.com", 
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