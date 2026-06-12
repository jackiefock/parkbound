import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;

    // Reject duplicates before trying to insert.
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'That email or username is already taken' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hash]
    );

    const user = { id: result.insertId, username };
    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      'SELECT id, username, password_hash FROM users WHERE email = ?',
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Wrong email or password' });
    }

    const match = await bcrypt.compare(password, rows[0].password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Wrong email or password' });
    }

    const user = { id: rows[0].id, username: rows[0].username };
    res.json({ token: signToken(user), user });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me  (protected)
export async function me(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
}
