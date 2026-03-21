import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { validateEnv } from '../config/env.js';
import { runMonthlyDraw } from '../services/draw.service.js';

const logic = process.env.DRAW_DEFAULT_LOGIC === 'algorithmic' ? 'algorithmic' : 'random';
const month = process.argv[2];

const run = async () => {
  try {
    validateEnv();
    await connectDB();

    const result = await runMonthlyDraw({ logic, month });
    console.log(result.message);
    process.exit(0);
  } catch (error) {
    console.error('Scheduled draw failed:', error.message);
    process.exit(1);
  }
};

run();
