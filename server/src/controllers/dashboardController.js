import pool from '../db.js';

// GET /api/dashboard  (protected)
// Returns some protected data so the lab's Dashboard page has something to show.
export async function getDashboard(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS planCount FROM plans WHERE user_id = ?',
      [req.user.id]
    );
    res.json({
      message: `Welcome back, ${req.user.username}.`,
      user: req.user,
      planCount: rows[0].planCount
    });
  } catch (err) {
    next(err);
  }
}
