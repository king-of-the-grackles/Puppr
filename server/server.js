import './loadEnv.js';
import express from 'express';
import cors from 'cors';
import { fetchDogWithProfile } from './services/dogService.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Parse CORS_ORIGIN as array if it's a comma-separated string
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: corsOrigin,
  credentials: true
}));
app.use(express.json());

// Request logging (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    version: '1.0.0'
  });
});

// Main dog endpoint
app.get('/api/dog', async (req, res) => {
  try {
    const dog = await fetchDogWithProfile();
    res.json({
      success: true,
      data: dog
    });
  } catch (error) {
    console.error('Error fetching dog:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dog or generate profile',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`= Puppr server running on port ${PORT}`);
  console.log(`=� Environment: ${process.env.NODE_ENV || 'development'}`);
});
