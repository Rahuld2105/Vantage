import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

const PLAN_PRICES = {
  catalyst: { monthly: 29, yearly: 278 },
  architect: { monthly: 89, yearly: 854 },
  foundational: { monthly: 249, yearly: 2390 },
};

export const getByUser = async (userId) => {
  const subscription = await Subscription.findOne({ userId }).populate('charityId');
  if (!subscription) {
    throw { statusCode: 404, message: 'Subscription not found' };
  }

  if (
    subscription.status === 'active' &&
    subscription.currentPeriodEnd &&
    new Date(subscription.currentPeriodEnd) < new Date()
  ) {
    subscription.status = subscription.cancelAtPeriodEnd ? 'cancelled' : 'inactive';
    await subscription.save();
  }

  return subscription;
};

export const updateCharity = async (userId, { charityId, charityPercent }) => {
  const subscription = await Subscription.findOneAndUpdate(
    { userId, status: 'active' },
    { charityId, charityPercent },
    { new: true }
  ).populate('charityId');
  
  if (!subscription) {
    throw { statusCode: 404, message: 'No active subscription found' };
  }
  
  await User.findByIdAndUpdate(userId, { charityId, charityPercent });
  
  return subscription;
};

export const getActiveSubscriberIds = async () => {
  const subscriptions = await Subscription.find({ status: 'active' }).select('userId');
  return subscriptions.map(s => s.userId);
};

export const calculateMonthlyPool = async () => {
  const subscriptions = await Subscription.find({ status: 'active' });
  
  let totalPool = 0;
  subscriptions.forEach(sub => {
    const price = PLAN_PRICES[sub.plan]?.[sub.billing] || 0;
    totalPool += price;
  });
  
  return totalPool;
};
