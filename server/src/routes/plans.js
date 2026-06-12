import { Router } from 'express';
import { body, param } from 'express-validator';
import { handleValidation } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import {
  listPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  addItem,
  deleteItem
} from '../controllers/planController.js';

const router = Router();

// Everything below requires a logged-in user.
router.use(requireAuth);

router.get('/', listPlans);

router.get('/:id', [param('id').isInt()], handleValidation, getPlan);

router.post(
  '/',
  [
    body('title').trim().isLength({ min: 1, max: 120 }).withMessage('Title is required').escape(),
    body('park').trim().isIn(['mk', 'ep', 'hs', 'ak']).withMessage('Invalid park'),
    body('visit_date').isISO8601().withMessage('Visit date must be YYYY-MM-DD'),
    body('bound_film').optional().trim().escape(),
    body('notes').optional().trim().escape()
  ],
  handleValidation,
  createPlan
);

router.put(
  '/:id',
  [
    param('id').isInt(),
    body('title').optional().trim().isLength({ min: 1, max: 120 }).escape(),
    body('bound_film').optional().trim().escape(),
    body('notes').optional().trim().escape(),
    body('visit_date').optional().isISO8601()
  ],
  handleValidation,
  updatePlan
);

router.delete('/:id', [param('id').isInt()], handleValidation, deletePlan);

router.post(
  '/:id/items',
  [
    param('id').isInt(),
    body('event_title').trim().isLength({ min: 1, max: 160 }).withMessage('Event title is required').escape(),
    body('event_time').optional().trim().escape(),
    body('event_type').optional().trim().escape(),
    body('location').optional().trim().escape()
  ],
  handleValidation,
  addItem
);

router.delete(
  '/:id/items/:itemId',
  [param('id').isInt(), param('itemId').isInt()],
  handleValidation,
  deleteItem
);

export default router;
