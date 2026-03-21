import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { connectDB } from '../config/db.js';

const [emailArg, nameArg, passwordArg] = process.argv.slice(2);
const email = emailArg?.trim().toLowerCase();

if (!email) {
  console.error('Usage: npm run make-admin -- <email> [name] [password]');
  process.exit(1);
}

const createOrPromoteAdmin = async () => {
  await connectDB();

  const existingUser = await User.findOne({ email }).select('+password');

  if (existingUser) {
    existingUser.role = 'admin';
    existingUser.isActive = true;
    await existingUser.save();

    console.log(`Promoted existing user to admin: ${email}`);
    return;
  }

  if (!nameArg || !passwordArg) {
    throw new Error(
      'User not found. To create a new admin, provide name and password: npm run make-admin -- <email> <name> <password>'
    );
  }

  const user = new User({
    name: nameArg,
    email,
    password: passwordArg,
    role: 'admin',
    isActive: true,
  });

  await user.save();
  console.log(`Created new admin user: ${email}`);
};

try {
  await createOrPromoteAdmin();
} catch (error) {
  console.error('Failed to create or promote admin:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.connection.close();
}
