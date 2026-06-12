import { validationResult } from 'express-validator';

// Runs after a route's validation rules. If anything failed, send the
// errors back as 400 instead of letting bad data reach the controller.
export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
  }
  next();
}
