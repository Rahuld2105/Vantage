import stripe, { getPriceId } from '../config/stripe.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import { resolvePublicAppUrl } from '../utils/origin.js';

export const createCheckoutSession = async ({ userId, plan, billing, charityId, charityPercent, email, origin }) => {
  const priceId = getPriceId(plan, billing);
  if (!priceId) {
    throw { statusCode: 400, message: 'Invalid plan or billing option' };
  }

  const appUrl = resolvePublicAppUrl(origin);
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/subscribe`,
    metadata: {
      userId: userId.toString(),
      plan: plan.toString(),
      billing: billing.toString(),
      charityId: charityId.toString(),
      charityPercent: charityPercent.toString(),
    },
  });
  
  return session;
};

const upsertSubscriptionFromSession = async (session) => {
  const subscriptionPayload = {
    plan: session.metadata.plan,
    billing: session.metadata.billing,
    charityId: session.metadata.charityId,
    charityPercent: Number(session.metadata.charityPercent),
    stripeCustomerId: session.customer,
    stripeSubscriptionId: session.subscription,
    status: 'active',
    ...(session.subscription_details?.current_period_end && {
      currentPeriodEnd: new Date(session.subscription_details.current_period_end * 1000),
    }),
  };

  const existingSubscription = await Subscription.findOne({ userId: session.metadata.userId });

  if (existingSubscription) {
    Object.assign(existingSubscription, subscriptionPayload);
    await existingSubscription.save();
  } else {
    await Subscription.create({
      userId: session.metadata.userId,
      ...subscriptionPayload,
    });
  }

  await User.findByIdAndUpdate(session.metadata.userId, {
    charityId: session.metadata.charityId,
    charityPercent: Number(session.metadata.charityPercent),
  });
};

export const confirmCheckoutSession = async ({ sessionId, userId }) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (!session) {
    throw { statusCode: 404, message: 'Checkout session not found' };
  }

  if (session.metadata?.userId !== userId.toString()) {
    throw { statusCode: 403, message: 'Checkout session does not belong to this user' };
  }

  const isPaid = session.payment_status === 'paid' || session.status === 'complete';
  if (!isPaid) {
    throw { statusCode: 400, message: 'Checkout session is not completed yet' };
  }

  await upsertSubscriptionFromSession(session);
  return await Subscription.findOne({ userId }).populate('charityId');
};

export const handleWebhook = async (rawBody, sig) => {
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    throw { statusCode: 400, message: 'Webhook signature verification failed' };
  }
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await upsertSubscriptionFromSession(session);
  } else if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object;
    const statusMap = {
      active: 'active',
      canceled: 'cancelled',
      past_due: 'past_due',
      unpaid: 'inactive',
      incomplete: 'inactive',
      incomplete_expired: 'inactive',
      trialing: 'active',
    };

    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        status: statusMap[subscription.status] || 'inactive',
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : undefined,
        cancelAtPeriodEnd: !!subscription.cancel_at_period_end,
      }
    );
  } else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        status: 'cancelled',
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : undefined,
        cancelAtPeriodEnd: !!subscription.cancel_at_period_end,
      }
    );
  }
};

export const cancelSubscription = async (stripeSubscriptionId) => {
  await stripe.subscriptions.update(stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
  
  const subscription = await Subscription.findOneAndUpdate(
    { stripeSubscriptionId },
    { cancelAtPeriodEnd: true },
    { new: true }
  );
  
  return subscription;
};
