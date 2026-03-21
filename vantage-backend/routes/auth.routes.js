import express from 'express';
import { registerRules, loginRules } from '../utils/validators.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.get('/me', protect, authController.getMe);

export default router;
