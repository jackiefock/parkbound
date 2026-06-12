import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import planRoutes from './routes/plans.js';
import dayRoutes from './routes/days.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

// Simple health check, handy for confirming the server is up and for hosting.
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', dayRoutes);

// 404 for anything not matched above.
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Central error handler. Controllers call next(err) and land here.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

export default app;
