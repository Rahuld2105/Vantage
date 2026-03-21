import { body } from 'express-validator';

export const registerRules = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('charityId')
    .optional()
    .isMongoId()
    .withMessage('Valid charity ID is required'),
  body('charityPercent')
    .optional()
    .isInt({ min: 10, max: 50 })
    .withMessage('Charity percent must be between 10 and 50'),
];

export const loginRules = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const scoreRules = [
  body('value')
    .isInt({ min: 1, max: 45 })
    .withMessage('Score must be between 1 and 45'),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required'),
];

export const scoreListRules = [
  body('scores')
    .isArray({ max: 5 })
    .withMessage('Scores must be an array of up to 5 entries'),
  body('scores.*.value')
    .isInt({ min: 1, max: 45 })
    .withMessage('Score must be between 1 and 45'),
  body('scores.*.date')
    .isISO8601()
    .withMessage('Valid date is required'),
];

export const subscriptionRules = [
  body('plan')
    .isIn(['catalyst', 'architect', 'foundational'])
    .withMessage('Invalid plan'),
  body('billing')
    .isIn(['monthly', 'yearly'])
    .withMessage('Billing must be monthly or yearly'),
  body('charityId')
    .notEmpty()
    .withMessage('Charity ID is required'),
  body('charityPercent')
    .isInt({ min: 10, max: 50 })
    .withMessage('Charity percent must be between 10 and 50'),
];
