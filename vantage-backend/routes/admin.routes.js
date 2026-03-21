import express from 'express';
import { protect } from '../middleware/auth.js';
import { adminAuth } from '../middleware/adminAuth.js';
import * as adminController from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/stats', protect, adminAuth, adminController.getStats);
router.get('/users', protect, adminAuth, adminController.getUsers);
router.put('/users/:id', protect, adminAuth, adminController.updateUser);
router.get('/users/:id/scores', protect, adminAuth, adminController.getUserScores);
router.put('/users/:id/scores', protect, adminAuth, adminController.replaceUserScores);
router.get('/subscriptions', protect, adminAuth, adminController.getSubscriptions);
router.put('/subscriptions/:id', protect, adminAuth, adminController.updateSubscription);
router.get('/winners', protect, adminAuth, adminController.getAllWinners);
router.put('/winners/:winnerId/verify', protect, adminAuth, adminController.verifyWinner);

export default router;
