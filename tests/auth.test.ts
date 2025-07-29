import request from 'supertest';
import app from '../src/index';

describe('Authentication Endpoints', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'testpassword123'
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).toHaveProperty('name', testUser.name);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email, password, and name are required');
    });

    it('should return 409 for duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'duplicate@example.com' });

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'duplicate@example.com' })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user for login tests
      await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'login@example.com' });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'login@example.com');
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });
  });

  describe('POST /api/auth/verify', () => {
    let authToken: string;

    beforeEach(async () => {
      // Register and login to get a token
      await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'verify@example.com' });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'verify@example.com',
          password: testUser.password
        });

      authToken = loginResponse.body.token;
    });

    it('should verify a valid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({ token: authToken })
        .expect(200);

      expect(response.body).toHaveProperty('valid', true);
      expect(response.body.user).toHaveProperty('email', 'verify@example.com');
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({ token: 'invalid-token' })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid token');
    });

    it('should return 400 for missing token', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Token is required');
    });
  });
});