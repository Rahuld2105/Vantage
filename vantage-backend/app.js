import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { isAllowedBrowserOrigin } from './utils/origin.js';

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

  if (req.path === '/health') {
    return next();
  }

  const forwardedProtoHeader = req.headers['x-forwarded-proto'];
  const forwardedProtocols = `${forwardedProtoHeader || ''}`
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (req.secure || forwardedProtocols.includes('https') || forwardedProtocols.length === 0) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'HTTPS is required in production',
  });
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin(origin, callback) {
    if (isAllowedBrowserOrigin(origin)) {
      return callback(null, true);
    }

    return callback({
      statusCode: 403,
      message: `Origin not allowed by CORS: ${origin || 'unknown origin'}`,
    });
  },
  credentials: true,
}));
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
    message: 'API is running',
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
