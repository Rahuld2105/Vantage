import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import * as winnerController from '../controllers/winner.controller.js';

const router = express.Router();

const upload = multer({
  dest: 'uploads/proofs/',
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  },
});

router.get('/', protect, winnerController.getMyWinnings);
router.post('/:winnerId/proof', protect, upload.single('proof'), winnerController.uploadProof);

export default router;
