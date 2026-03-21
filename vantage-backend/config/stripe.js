import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getPriceId = (plan, billing) => {
  const priceMap = {
    catalyst: {
      monthly: process.env.STRIPE_MONTHLY_PRICE_CATALYST,
      yearly: process.env.STRIPE_YEARLY_PRICE_CATALYST,
    },
    architect: {
      monthly: process.env.STRIPE_MONTHLY_PRICE_ARCHITECT,
      yearly: process.env.STRIPE_YEARLY_PRICE_ARCHITECT,
    },
    foundational: {
      monthly: process.env.STRIPE_MONTHLY_PRICE_FOUNDATIONAL,
      yearly: process.env.STRIPE_YEARLY_PRICE_FOUNDATIONAL,
    },
  };
  return priceMap[plan]?.[billing];
};

export default stripe;
