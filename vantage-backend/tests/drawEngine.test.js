import test from 'node:test';
import assert from 'node:assert/strict';
import {
  countMatches,
  generateAlgorithmicDraw,
  generateRandomDraw,
  getTier,
} from '../utils/drawEngine.js';
import { calculatePools, splitPrize } from '../utils/prizeCalculator.js';

test('generateRandomDraw returns 5 unique sorted values in range', () => {
  const draw = generateRandomDraw();
  assert.equal(draw.length, 5);
  assert.deepEqual([...draw].sort((a, b) => a - b), draw);
  assert.equal(new Set(draw).size, 5);
  assert.ok(draw.every((value) => value >= 1 && value <= 45));
});

test('generateAlgorithmicDraw balances high and low frequency values', () => {
  const draw = generateAlgorithmicDraw([1, 1, 1, 1, 2, 2, 3, 4, 44, 45]);
  assert.equal(draw.length, 5);
  assert.ok(draw.includes(1));
  assert.ok(draw.includes(44) || draw.includes(45));
  assert.ok(draw.every((value) => value >= 1 && value <= 45));
});

test('match counting and tiers work as expected', () => {
  assert.equal(countMatches([1, 2, 3, 4, 5], [1, 2, 3, 9, 10]), 3);
  assert.equal(getTier(5), '5-match');
  assert.equal(getTier(4), '4-match');
  assert.equal(getTier(3), '3-match');
  assert.equal(getTier(2), null);
});

test('pool calculation and prize splitting follow configured shares', () => {
  const pools = calculatePools(1000, 200);
  assert.equal(pools.fiveMatch, 600);
  assert.equal(pools.fourMatch, 350);
  assert.equal(pools.threeMatch, 250);
  assert.equal(splitPrize(600, 3), 200);
});
