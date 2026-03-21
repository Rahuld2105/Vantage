const REQUIRED_ENV_VARS = [
  'NODE_ENV',
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_MONTHLY_PRICE_CATALYST',
  'STRIPE_MONTHLY_PRICE_ARCHITECT',
  'STRIPE_MONTHLY_PRICE_FOUNDATIONAL',
  'STRIPE_YEARLY_PRICE_CATALYST',
  'STRIPE_YEARLY_PRICE_ARCHITECT',
  'STRIPE_YEARLY_PRICE_FOUNDATIONAL',
  'CLIENT_URL',
];

const PROD_ONLY_ENV_RULES = [
  {
    name: 'JWT_SECRET',
    isValid: (value) => value.length >= 32 && !value.includes('change_this_in_production'),
    message: 'JWT_SECRET must be at least 32 characters and not use a placeholder value.',
  },
  {
    name: 'STRIPE_SECRET_KEY',
    isValid: (value) => /^sk_(live|test)_/.test(value),
    message: 'STRIPE_SECRET_KEY must be a valid Stripe secret key.',
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    isValid: (value) => /^whsec_/.test(value),
    message: 'STRIPE_WEBHOOK_SECRET must be a valid Stripe webhook signing secret.',
  },
  {
    name: 'CLIENT_URL',
    isValid: (value) =>
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .every((origin) => {
          try {
            const parsed = new URL(origin);
            return parsed.protocol === 'https:';
          } catch {
            return false;
          }
        }),
    message: 'CLIENT_URL must contain one or more valid HTTPS origins in production.',
  },
];

export const validateEnv = () => {
  const missingVars = REQUIRED_ENV_VARS.filter((name) => !process.env[name]?.trim());
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  const nodeEnv = process.env.NODE_ENV?.trim();
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error('NODE_ENV must be one of: development, test, production');
  }

  const port = Number(process.env.PORT);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a valid positive integer');
  }

  if (nodeEnv === 'production') {
    const failedRules = PROD_ONLY_ENV_RULES.filter(
      (rule) => !rule.isValid(process.env[rule.name]?.trim() || '')
    );

    if (failedRules.length > 0) {
      throw new Error(
        `Invalid production environment configuration:\n${failedRules
          .map((rule) => `- ${rule.message}`)
          .join('\n')}`
      );
    }
  }
};
