import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import { signToken } from '../config/jwt.js';
import { sendWelcome } from './email.service.js';

const attachSubscriptionSummary = async (user) => {
  if (!user) {
    return user;
  }

  const subscription = await Subscription.findOne({ userId: user._id }).populate('charityId');
  const normalizedStatus =
    subscription?.status === 'active' &&
    subscription.currentPeriodEnd &&
    new Date(subscription.currentPeriodEnd) < new Date()
      ? (subscription.cancelAtPeriodEnd ? 'cancelled' : 'inactive')
      : subscription?.status || 'inactive';

  return {
    ...user.toJSON(),
    subscriptionSummary: subscription
      ? {
          id: subscription._id,
          plan: subscription.plan,
          billing: subscription.billing,
          status: normalizedStatus,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          charityId: subscription.charityId,
          charityPercent: subscription.charityPercent,
        }
      : null,
  };
};

export const register = async ({ name, email, password, charityId, charityPercent }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw { statusCode: 400, message: 'Email already registered' };
  }
  
  const user = new User({
    name,
    email,
    password,
    ...(charityId && { charityId }),
    ...(charityPercent && { charityPercent }),
  });
  await user.save();
  
  const token = signToken(user._id);
  
  try {
    await sendWelcome(user);
  } catch (emailError) {
    console.error('Welcome email failed:', emailError.message);
  }
  
  return {
    user: await attachSubscriptionSummary(await User.findById(user._id).populate('charityId')),
    token,
  };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw { statusCode: 401, message: 'Invalid email or password' };
  }
  
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw { statusCode: 401, message: 'Invalid email or password' };
  }
  
  const token = signToken(user._id);
  
  return {
    user: await attachSubscriptionSummary(await User.findById(user._id).populate('charityId')),
    token,
  };
};

export const getMe = async (userId) => {
  const user = await User.findById(userId).populate('charityId');
  if (!user) {
    throw { statusCode: 404, message: 'User not found' };
  }
  return attachSubscriptionSummary(user);
};
