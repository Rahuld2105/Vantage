import express from 'express';
import { protect } from '../middleware/auth.js';
import { adminAuth } from '../middleware/adminAuth.js';
import * as drawController from '../controllers/draw.controller.js';

const router = express.Router();

router.get('/history', drawController.getHistory);
router.get('/draft', protect, adminAuth, drawController.getDraftDraw);
router.post('/:id/simulate', protect, adminAuth, drawController.simulate);
router.post('/:id/publish', protect, adminAuth, drawController.publish);

export default router;
