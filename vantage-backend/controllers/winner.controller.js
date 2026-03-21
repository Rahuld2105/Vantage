import * as winnerService from '../services/winner.service.js';
import { success, error } from '../utils/apiResponse.js';
import { buildUploadUrl } from '../utils/storage.js';

export const getMyWinnings = async (req, res, next) => {
  try {
    const winnings = await winnerService.getMyWinnings(req.user._id);
    success(res, winnings, 'Winnings retrieved');
  } catch (err) {
    error(res, 'Failed to retrieve winnings', 500);
  }
};

export const uploadProof = async (req, res, next) => {
  try {
    const { winnerId } = req.params;
    
    if (!req.file) {
      return error(res, 'No file uploaded', 400);
    }
    
    const filePath = `/uploads/proofs/${req.file.filename}`;
    const winner = await winnerService.uploadProof(winnerId, req.user._id, filePath);
    success(res, {
      ...winner.toObject(),
      proofUrl: buildUploadUrl(filePath),
    }, 'Proof uploaded');
  } catch (err) {
    error(res, err.message || 'Failed to upload proof', err.statusCode || 500);
  }
};
