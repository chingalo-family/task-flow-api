import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import teamRoutes from './routes/team.routes';
import userRoutes from './routes/user.routes';
import notificationRoutes from './routes/notification.routes';
import { setupSwagger } from './utils/swagger';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression()); // Compress all responses
app.use(express.json());

// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Restrict in production
  credentials: true
}));

// Security Configuration
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for HTML pages
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter); // Apply to API routes

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400 // Log only errors in production to reduce IO
  }));
} else {
  app.use(morgan('dev'));
}

// Serve static files (for password reset HTML page)
app.use(express.static('public'));

// Routes Configuration
// Swagger
setupSwagger(app, Number(PORT));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
import { errorHandler } from './middleware/error.middleware';

app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('Task Flow API is running');
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
