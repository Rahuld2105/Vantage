import express from 'express';
import { protect } from '../middleware/auth.js';
import { adminAuth } from '../middleware/adminAuth.js';
import * as charityController from '../controllers/charity.controller.js';

const router = express.Router();

router.get('/', charityController.getAll);
router.get('/:id', charityController.getById);
router.post('/:id/donations', charityController.donate);
router.post('/', protect, adminAuth, charityController.create);
router.put('/:id', protect, adminAuth, charityController.update);
router.delete('/:id', protect, adminAuth, charityController.remove);

export default router;
