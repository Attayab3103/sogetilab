import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import http from 'http';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config();

// Import database connection
import connectDB from './config/database';

// Import routes
import authRoutes from './routes/auth';
import resumeRoutes from './routes/resumes';
import sessionRoutes from './routes/sessions';

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Serve static files for frontend in production
if (process.env.NODE_ENV === 'production') {
  // Correctly determine the path to the frontend build directory
  // Assuming 'dist' is the build output of the frontend in the root directory
  const frontendPath = path.join(__dirname, '../../dist');
  app.use(express.static(frontendPath));

  // For any other route, serve the index.html from the frontend build
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendPath, 'index.html'));
  });
}

// CORS middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true,
}));

// Static files middleware (for uploads) - commented out for now
// app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/sessions', sessionRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Jyothi\'s AI Server is running!',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});


// --- WebSocket setup ---
// setupWebSocket(app, server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.log('❌ Unhandled Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

export default app;
