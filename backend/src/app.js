import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import connectDB from './config/db.js'

const app = express();

const ensureDBConnection = async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (error) {
    console.error('Database connection error:', error.message)

    return res.status(500).json({
      success: false,
      data: null,
      message: 'Database connection failed',
      token: null,
    })
  }
}

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task Management System API is running',
    data: null,
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API health check success',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

app.use('/api/auth', ensureDBConnection, authRoutes)
app.use('/api/tasks', ensureDBConnection, taskRoutes)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    data: null,
    token: null,
  });
});

export default app;