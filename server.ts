import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import utilities and middleware
import logger from './src/utils/logger.js';
import corsMiddleware from './src/utils/cors.js';
import database from './src/config/database.js';
import { 
  globalErrorHandler, 
  AppError, 
  handleUnhandledRejection, 
  handleUncaughtException 
} from './src/middleware/errorHandler.js';

handleUncaughtException();
handleUnhandledRejection();

const app = express();

app.set('trust proxy', 1);

app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {  
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'API is working',
    version: '1.0.0'
  });
});

// Example protected route (you can add your authentication middleware here)
app.get('/api/protected', (req: Request, res: Response) => {
  // This is where you'd typically check for authentication
  res.status(200).json({
    status: 'success',
    message: 'This is a protected route',
    data: {
      user: 'authenticated_user'
    }
  });
});

// Handle undefined routes - using a more specific pattern
app.use((req: Request, res: Response, next: NextFunction) => {
  if (!res.headersSent) {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  }
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;

// Initialize database connection and start server
const startServer = async () => {
  try {
    // Connect to database
    await database.connect();
    
    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully`);
      
      server.close(async () => {
        try {
          await database.disconnect();
          logger.info('Process terminated');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown', {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          });
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    process.exit(1);
  }
};

// Start the application
startServer();

export default app;