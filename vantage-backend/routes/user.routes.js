import express from 'express';
import { protect } from '../middleware/auth.js';
import * as userController from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', protect, userController.getProfile);
router.put('/', protect, userController.updateProfile);

export default router;
