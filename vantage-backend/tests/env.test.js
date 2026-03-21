import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEnv } from '../config/env.js';

const baseEnv = {
  NODE_ENV: 'production',
  PORT: '6000',
  MONGO_URI: 'mongodb+srv://example/test',
  JWT_SECRET: 'abcdefghijklmnopqrstuvwxyz1234567890',
  JWT_EXPIRES_IN: '7d',
  STRIPE_SECRET_KEY: 'sk_live_123456789',
  STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
  STRIPE_MONTHLY_PRICE_CATALYST: 'price_monthly_catalyst',
  STRIPE_MONTHLY_PRICE_ARCHITECT: 'price_monthly_architect',
  STRIPE_MONTHLY_PRICE_FOUNDATIONAL: 'price_monthly_foundational',
  STRIPE_YEARLY_PRICE_CATALYST: 'price_yearly_catalyst',
  STRIPE_YEARLY_PRICE_ARCHITECT: 'price_yearly_architect',
  STRIPE_YEARLY_PRICE_FOUNDATIONAL: 'price_yearly_foundational',
  CLIENT_URL: 'https://example.com',
};

test('validateEnv passes for a valid production configuration', () => {
  const previousEnv = { ...process.env };
  process.env = { ...process.env, ...baseEnv };

  assert.doesNotThrow(() => validateEnv());

  process.env = previousEnv;
});

test('validateEnv rejects insecure production configuration', () => {
  const previousEnv = { ...process.env };
  process.env = {
    ...process.env,
    ...baseEnv,
    JWT_SECRET: 'too-short',
    CLIENT_URL: 'http://example.com',
  };

  assert.throws(() => validateEnv());

  process.env = previousEnv;
});
