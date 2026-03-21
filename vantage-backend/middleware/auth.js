import { verifyToken } from '../config/jwt.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

const normalizeSubscriptionStatus = (subscription) => {
  if (!subscription) {
    return null;
  }

  if (
    subscription.status === 'active' &&
    subscription.currentPeriodEnd &&
    new Date(subscription.currentPeriodEnd) < new Date()
  ) {
    subscription.status = subscription.cancelAtPeriodEnd ? 'cancelled' : 'inactive';
  }

  return subscription;
};

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const user = await User.findById(decoded.id).populate('charityId');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated' });
    }

    const subscription = normalizeSubscriptionStatus(
      await Subscription.findOne({ userId: user._id }).populate('charityId')
    );

    if (subscription?.isModified?.()) {
      await subscription.save();
    }

    req.user = user;
    req.subscription = subscription;
    req.subscriptionStatus = subscription?.status || 'inactive';
    req.hasActiveSubscription = req.subscriptionStatus === 'active';

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

export const requireActiveSubscription = (req, res, next) => {
  if (!req.hasActiveSubscription) {
    return res.status(403).json({
      success: false,
      message: 'An active subscription is required for this action',
    });
  }

  next();
};
