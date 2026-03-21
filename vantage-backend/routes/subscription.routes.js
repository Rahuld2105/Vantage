import express from 'express';
import { subscriptionRules } from '../utils/validators.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import * as subscriptionController from '../controllers/subscription.controller.js';

const router = express.Router();

router.post('/webhook', subscriptionController.handleWebhook);
router.post('/checkout', protect, subscriptionRules, validate, subscriptionController.createCheckout);
router.post('/confirm-checkout', protect, subscriptionController.confirmCheckout);
router.get('/', protect, subscriptionController.getMySubscription);
router.put('/charity', protect, subscriptionController.updateCharity);
router.delete('/', protect, subscriptionController.cancelSubscription);

export default router;
