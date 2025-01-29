const request = require('supertest');
const app = require('../server');  // Import the Express app

jest.mock('../db/conn'); // Mock the database module
const { getUsers, addUser, findUserByUsername } = require('../db/conn');

// Mocking bcrypt
const bcrypt = require('bcryptjs');
jest.mock('bcryptjs');

// Mocking JWT
const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken');

// Test the /new route for creating a user
describe('POST /new', () => {
  it('should create a new user successfully', async () => {
    // Mock data
    const newUser = {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Street',
      phone: '1234567890',
      pincode: '123456',
      username: 'johndoe',
      password: 'password123',
    };

    // Mock DB query
    const mockExistingUser = [];
    findUserByUsername.mockResolvedValue(mockExistingUser);

    // Mock bcrypt hash
    bcrypt.hashSync = jest.fn().mockReturnValue('hashedpassword123');

    // Mock the query response for adding a user
    const mockAddUserResult = { affectedRows: 1 };
    addUser.mockResolvedValue(mockAddUserResult);

    const response = await request(app).post('/users/new').send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User created successfully');
  });

  it('should fail when username already exists', async () => {
    // Mock data
    const newUser = {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Street',
      phone: '1234567890',
      pincode: '123456',
      username: 'johndoe',
      password: 'password123',
    };

    // Mock DB query
    const mockExistingUser = [{ username: 'johndoe' }];
    findUserByUsername.mockResolvedValue(mockExistingUser);

    const response = await request(app).post('/users/new').send(newUser);

    expect(response.status).toBe(409);
    expect(response.text).toBe('Username already exists');
  });

  it('should return 500 when there is a system error', async () => {
    // Mock DB query
    findUserByUsername.mockRejectedValue(new Error('Database error'));

    const newUser = {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Street',
      phone: '1234567890',
      pincode: '123456',
      username: 'johndoe',
      password: 'password123',
    };

    const response = await request(app).post('/users/new').send(newUser);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('System error');
  });
});

// Test the /login route for user login
describe('POST /login', () => {
  it('should login successfully with correct credentials', async () => {
    // Mock login data
    const loginData = {
      username: 'johndoe',
      password: 'password123',
    };

    // Mock user data from DB
    const mockUser = [
      {
        userId: '1',
        username: 'johndoe',
        password: 'hashedpassword123', // Assume this is a hashed version
      },
    ];
    findUserByUsername.mockResolvedValue(mockUser);

    // Mock bcrypt.compareSync to return true
    bcrypt.compare.mockResolvedValue(true);

    // Mock JWT token generation
    jwt.sign.mockReturnValue('mocked-jwt-token');

    const response = await request(app).post('/users/login').send(loginData);

    expect(response.status).toBe(200);
    expect(response.body.token).toBe('mocked-jwt-token');
  });

  it('should return 404 if user not found', async () => {
    const loginData = {
      username: 'unknownuser',
      password: 'password123',
    };

    // Mock DB query for user not found
    findUserByUsername.mockResolvedValue([]);

    const response = await request(app).post('/users/login').send(loginData);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('should return 401 for invalid credentials', async () => {
    const loginData = {
      username: 'johndoe',
      password: 'wrongpassword',
    };

    // Mock user data from DB
    const mockUser = [
      {
        userId: '1',
        username: 'johndoe',
        password: 'hashedpassword123', // Assume this is a hashed version
      },
    ];
    findUserByUsername.mockResolvedValue(mockUser);

    // Mock bcrypt.compare to return false
    bcrypt.compare.mockResolvedValue(false);

    const response = await request(app).post('/users/login').send(loginData);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Credentials Invalid! Check Again');
  });
});
