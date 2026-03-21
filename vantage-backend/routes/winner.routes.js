import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/auth.js';
import * as winnerController from '../controllers/winner.controller.js';
import { getSafeUploadFilename } from '../utils/storage.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/proofs/');
  },
  filename: (req, file, cb) => {
    cb(null, getSafeUploadFilename(file.originalname, 'proof'));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const allowedExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp']);

    if (file.mimetype.startsWith('image/') && allowedExtensions.has(extension)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, JPG, JPEG, and WEBP image files are allowed'), false);
    }
  },
});

router.get('/', protect, winnerController.getMyWinnings);
router.post('/:winnerId/proof', protect, upload.single('proof'), winnerController.uploadProof);

export default router;
