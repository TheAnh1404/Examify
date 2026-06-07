import express from 'express';
import cors from 'cors';

// Import routers
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import examRoutes from './routes/exam.routes.js';
import submissionRoutes from './routes/submission.routes.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // For development flexibility. In production, restrict to specific clients.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root API status endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Examify REST API.',
    status: 'Healthy',
    timestamp: new Date()
  });
});

// Bind API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/submissions', submissionRoutes);

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ message: `API endpoint '${req.originalUrl}' not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred on the server.',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

export default app;
