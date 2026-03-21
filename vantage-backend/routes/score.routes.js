import express from 'express';
import { scoreListRules, scoreRules } from '../utils/validators.js';
import { validate } from '../middleware/validate.js';
import { protect, requireActiveSubscription } from '../middleware/auth.js';
import * as scoreController from '../controllers/score.controller.js';

const router = express.Router();

router.get('/', protect, scoreController.getScores);
router.post('/', protect, requireActiveSubscription, scoreRules, validate, scoreController.addScore);
router.put('/', protect, requireActiveSubscription, scoreListRules, validate, scoreController.replaceScores);

export default router;
