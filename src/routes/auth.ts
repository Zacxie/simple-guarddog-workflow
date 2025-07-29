import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

// Mock user database (in real app, use proper database)
const users: { [key: string]: { id: string; email: string; password: string; name: string } } = {};

// Register endpoint
router.post('/register', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password, name } = req.body;

  // Basic validation
  if (!email || !password || !name) {
    res.status(400).json({ error: 'Email, password, and name are required' });
    return;
  }

  if (users[email]) {
    res.status(409).json({ error: 'User already exists' });
    return;
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Store user
  const userId = `user_${Date.now()}`;
  users[email] = {
    id: userId,
    email,
    password: hashedPassword,
    name
  };

  logger.info(`New user registered: ${email}`);

  res.status(201).json({
    message: 'User registered successfully',
    user: { id: userId, email, name }
  });
}));

// Login endpoint
router.post('/login', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = users[email];
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  // Check password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  // Generate JWT token
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    secret,
    { expiresIn: '24h' }
  );

  logger.info(`User logged in: ${email}`);

  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, email: user.email, name: user.name }
  });
}));

// Token verification endpoint
router.post('/verify', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({ error: 'Token is required' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
    const decoded = jwt.verify(token, secret) as any;
    
    res.json({
      valid: true,
      user: { userId: decoded.userId, email: decoded.email }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}));

export const authRouter = router;