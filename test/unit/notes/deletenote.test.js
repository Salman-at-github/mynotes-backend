const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../app'); // path to your index file
const server = require('../../../server');
const User = require('../../../models/User');
const bcrypt = require('bcryptjs');
const Notes = require('../../../models/Notes');

describe('DELETE /api/v1/notes/delete/:id', () => {
  let user;
  let token;
  let createdNote;

  //before tests,create a user, login, get the authtoken from login api
  beforeAll(async () => {
    // Connect to your database here
    await mongoose.connect(process.env.MONGO_URL);

    const fakeSalt = await bcrypt.genSalt();
    const hashPass = await bcrypt.hash("Password", fakeSalt)
    const newUser = new User({name : "Tester", email : "testuser@gmail.com", password: hashPass});
    await newUser.save();
    user = newUser;
    // Log in the test user to get a JWT token
    const loginResponse = await request(app)
      .post('/api/v1/auth/signin')
      .send({ email: 'testuser@gmail.com', password: 'Password' });

    // Save the JWT token
    token = loginResponse.body.authtoken;
    const newNote = new Notes({
      user: user._id,
      title: "Testing",
      description: "Test note",
      tag:"Tester"
    })
    const savedNote = await newNote.save();
    createdNote = savedNote;
  });
  
//after tests, delete the user, note and end the connection
afterAll(async () => {
  await user.remove();
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
