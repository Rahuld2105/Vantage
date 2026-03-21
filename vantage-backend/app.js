import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import scoreRoutes from './routes/score.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import drawRoutes from './routes/draw.routes.js';
import charityRoutes from './routes/charity.routes.js';
import winnerRoutes from './routes/winner.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('trust proxy', 1);

app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  const forwardedProto = req.headers['x-forwarded-proto'];
  if (req.secure || forwardedProto === 'https') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'HTTPS is required in production',
  });
});

const configuredOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

const isAllowedDevOrigin = (origin) => {
  if (!origin) return true;

  try {
    const { hostname, protocol } = new URL(origin);
    return (
      protocol === 'http:' &&
      (hostname === 'localhost' || hostname === '127.0.0.1')
    );
  } catch {
    return false;
  }
};

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({
  verify: (req, res, buf) => {
    if (req.originalUrl === '/api/subscriptions/webhook') {
      req.rawBody = buf;
    }
  },
}));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API is running 🚀'
  });
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/winners', winnerRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

export default app;
