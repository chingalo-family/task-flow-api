import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import teamRoutes from './routes/team.routes';
import userRoutes from './routes/user.routes';
import notificationRoutes from './routes/notification.routes';
import { setupSwagger } from './utils/swagger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for HTML pages
}));
app.use(morgan('dev'));

// Serve static files (for password reset HTML page)
app.use(express.static('public'));

// Routes Configuration
const apiPrefix = process.env.API_PREFIX ? `/${process.env.API_PREFIX}` : '';

// Swagger
setupSwagger(app, Number(PORT), apiPrefix);

// Routes
app.use(`${apiPrefix}/api/auth`, authRoutes);
app.use(`${apiPrefix}/api/tasks`, taskRoutes);
app.use(`${apiPrefix}/api/teams`, teamRoutes);
app.use(`${apiPrefix}/api/users`, userRoutes);
app.use(`${apiPrefix}/api/notifications`, notificationRoutes);

app.get('/', (req, res) => {
  res.send('Task Flow API is running');
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
