import User from '../models/User.js';
import { success, error } from '../utils/apiResponse.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('charityId');
    success(res, user, 'Profile retrieved');
  } catch (err) {
    error(res, 'Failed to retrieve profile', 500);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!user) {
      return error(res, 'User not found', 404);
    }

    if (email && email !== user.email) {
      if (!emailPattern.test(email)) {
        return error(res, 'Please provide a valid email address', 400);
      }
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingUser) {
        return error(res, 'Email already in use', 400);
      }
      user.email = email;
    }

    if (typeof name === 'string' && name.trim()) {
      user.name = name.trim();
    }

    if (typeof password === 'string' && password.trim()) {
      if (password.trim().length < 6) {
        return error(res, 'Password must be at least 6 characters', 400);
      }
      user.password = password.trim();
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id).populate('charityId');
    success(res, updatedUser, 'Profile updated');
  } catch (err) {
    error(res, err.message || 'Failed to update profile', 500);
  }
};
