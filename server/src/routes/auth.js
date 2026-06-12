import { Router } from 'express';
import { body } from 'express-validator';
import { handleValidation } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { register, login, me } from '../controllers/authController.js';

const router = Router();

router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3 to 50 characters').escape(),
    body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  handleValidation,
  register
);

router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  handleValidation,
  login
);

router.get('/me', requireAuth, me);

export default router;
