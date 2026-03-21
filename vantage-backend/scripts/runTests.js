import assert from 'node:assert/strict';
import {
  countMatches,
  generateAlgorithmicDraw,
  generateRandomDraw,
  getTier,
} from '../utils/drawEngine.js';
import { validateEnv } from '../config/env.js';
import { calculatePools, splitPrize } from '../utils/prizeCalculator.js';

const tests = [];

const addTest = (name, fn) => {
  tests.push({ name, fn });
};

addTest('generateRandomDraw returns 5 unique sorted values in range', () => {
  const draw = generateRandomDraw();
  assert.equal(draw.length, 5);
  assert.deepEqual([...draw].sort((a, b) => a - b), draw);
  assert.equal(new Set(draw).size, 5);
  assert.ok(draw.every((value) => value >= 1 && value <= 45));
});

addTest('generateAlgorithmicDraw balances high and low frequency values', () => {
  const draw = generateAlgorithmicDraw([1, 1, 1, 1, 2, 2, 3, 4, 44, 45]);
  assert.equal(draw.length, 5);
  assert.ok(draw.includes(1));
  assert.ok(draw.includes(44) || draw.includes(45));
  assert.ok(draw.every((value) => value >= 1 && value <= 45));
});

addTest('match counting and tiers work as expected', () => {
  assert.equal(countMatches([1, 2, 3, 4, 5], [1, 2, 3, 9, 10]), 3);
  assert.equal(getTier(5), '5-match');
  assert.equal(getTier(4), '4-match');
  assert.equal(getTier(3), '3-match');
  assert.equal(getTier(2), null);
});

addTest('pool calculation and prize splitting follow configured shares', () => {
  const pools = calculatePools(1000, 200);
  assert.equal(pools.fiveMatch, 600);
  assert.equal(pools.fourMatch, 350);
  assert.equal(pools.threeMatch, 250);
  assert.equal(splitPrize(600, 3), 200);
});

addTest('validateEnv passes for a valid production configuration', () => {
  const previousEnv = { ...process.env };
  process.env = {
    ...process.env,
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

  assert.doesNotThrow(() => validateEnv());
  process.env = previousEnv;
});

addTest('validateEnv rejects insecure production configuration', () => {
  const previousEnv = { ...process.env };
  process.env = {
    ...process.env,
    NODE_ENV: 'production',
    PORT: '6000',
    MONGO_URI: 'mongodb+srv://example/test',
    JWT_SECRET: 'short',
    JWT_EXPIRES_IN: '7d',
    STRIPE_SECRET_KEY: 'sk_live_123456789',
    STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
    STRIPE_MONTHLY_PRICE_CATALYST: 'price_monthly_catalyst',
    STRIPE_MONTHLY_PRICE_ARCHITECT: 'price_monthly_architect',
    STRIPE_MONTHLY_PRICE_FOUNDATIONAL: 'price_monthly_foundational',
    STRIPE_YEARLY_PRICE_CATALYST: 'price_yearly_catalyst',
    STRIPE_YEARLY_PRICE_ARCHITECT: 'price_yearly_architect',
    STRIPE_YEARLY_PRICE_FOUNDATIONAL: 'price_yearly_foundational',
    CLIENT_URL: 'http://example.com',
  };

  assert.throws(() => validateEnv());
  process.env = previousEnv;
});

let failures = 0;
for (const { name, fn } of tests) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}`);
    console.error(error.message);
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log(`All ${tests.length} tests passed.`);
