import * as subscriptionService from '../services/subscription.service.js';
import * as stripeService from '../services/stripe.service.js';
import { success, error } from '../utils/apiResponse.js';

export const createCheckout = async (req, res, next) => {
  try {
    const { plan, billing, charityId, charityPercent } = req.body;
    
    const session = await stripeService.createCheckoutSession({
      userId: req.user._id.toString(),
      plan,
      billing,
      charityId,
      charityPercent,
      email: req.user.email,
      origin: req.get('origin') || req.get('referer'),
    });
    
    success(res, { sessionId: session.id, url: session.url }, 'Checkout session created');
  } catch (err) {
    error(res, err.message || 'Failed to create checkout session', err.statusCode || 500);
  }
};

export const getMySubscription = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.getByUser(req.user._id);
    success(res, subscription, 'Subscription retrieved');
  } catch (err) {
    error(res, err.message || 'Subscription not found', err.statusCode || 404);
  }
};

export const confirmCheckout = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const subscription = await stripeService.confirmCheckoutSession({
      sessionId,
      userId: req.user._id,
    });
    success(res, subscription, 'Checkout session confirmed');
  } catch (err) {
    error(res, err.message || 'Failed to confirm checkout session', err.statusCode || 500);
  }
};

export const updateCharity = async (req, res, next) => {
  try {
    const { charityId, charityPercent } = req.body;
    const subscription = await subscriptionService.updateCharity(req.user._id, {
      charityId,
      charityPercent,
    });
    success(res, subscription, 'Charity updated');
  } catch (err) {
    error(res, err.message || 'Failed to update charity', err.statusCode || 500);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.getByUser(req.user._id);
    
    await stripeService.cancelSubscription(subscription.stripeSubscriptionId);
    
    success(res, { message: 'Subscription cancelled at period end' });
  } catch (err) {
    error(res, 'Failed to cancel subscription', 500);
  }
};

export const handleWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const rawBody = req.rawBody || req.body;
    await stripeService.handleWebhook(rawBody, sig);
    success(res, { received: true }, 'Webhook processed');
  } catch (err) {
    error(res, err.message || 'Webhook processing failed', err.statusCode || 400);
  }
};
