import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { validateEnv } from './config/env.js';

const PORT = process.env.PORT || 6000;

const start = async () => {
  try {
    validateEnv();
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

start();
