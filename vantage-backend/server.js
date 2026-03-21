import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { validateEnv } from './config/env.js';

const PORT = process.env.PORT || 6000;

const start = async () => {
  try {
    console.log("🚀 Starting server...");

    // COMMENT THIS FOR NOW
    // validateEnv();

    console.log("🔌 Connecting to DB...");
    await connectDB();

    console.log("✅ DB Connected");

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

start();