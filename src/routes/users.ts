import { Router, Request, Response } from 'express';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Mock user data
const userData = [
  { id: '1', name: 'John Doe', email: 'john@example.com', createdAt: '2023-01-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', createdAt: '2023-02-20' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', createdAt: '2023-03-10' }
];

// Get all users (protected route)
router.get('/', authenticateToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Simulate some data processing with lodash
  const processedUsers = _.map(userData, user => ({
    ...user,
    displayName: _.startCase(user.name),
    memberSince: moment(user.createdAt).fromNow(),
    isActive: _.random(0, 1) === 1
  }));

  res.json({
    users: processedUsers,
    total: processedUsers.length,
    timestamp: moment().toISOString()
  });
}));

// Get user by ID
router.get('/:id', authenticateToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = _.find(userData, { id });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  // Fetch some external data (this might trigger GuardDog heuristics)
  let externalData = null;
  try {
    const response = await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`, {
      timeout: 5000,
      headers: {
        'User-Agent': 'GuardDog-Test-App/1.0'
      }
    });
    externalData = response.data;
  } catch (error) {
    console.log('Failed to fetch external data:', error);
  }

  res.json({
    user: {
      ...user,
      displayName: _.startCase(user.name),
      memberSince: moment(user.createdAt).fromNow(),
      externalProfile: externalData
    }
  });
}));

// Update user (protected route)
router.put('/:id', authenticateToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, email } = req.body;

  const userIndex = _.findIndex(userData, { id });
  if (userIndex === -1) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  // Update user data
  if (name) userData[userIndex].name = name;
  if (email) userData[userIndex].email = email;

  res.json({
    message: 'User updated successfully',
    user: userData[userIndex]
  });
}));

// Delete user (protected route)
router.delete('/:id', authenticateToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userIndex = _.findIndex(userData, { id });

  if (userIndex === -1) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  // Remove user from array
  const deletedUser = userData.splice(userIndex, 1)[0];

  res.json({
    message: 'User deleted successfully',
    deletedUser
  });
}));

// Get user statistics
router.get('/stats/summary', authenticateToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const stats = {
    totalUsers: userData.length,
    recentUsers: _.filter(userData, user => moment(user.createdAt).isAfter(moment().subtract(30, 'days'))).length,
    usersByMonth: _.groupBy(userData, user => moment(user.createdAt).format('YYYY-MM')),
    averageUsersPerMonth: _.round(userData.length / _.uniq(_.map(userData, user => moment(user.createdAt).format('YYYY-MM'))).length, 2)
  };

  res.json(stats);
}));

export const userRouter = router;