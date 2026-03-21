import Winner from '../models/Winner.js';
import { sendPaymentConfirmation } from './email.service.js';

export const getMyWinnings = async (userId) => {
  const winnings = await Winner.find({ userId }).populate('drawId');
  return winnings;
};

export const uploadProof = async (winnerId, userId, filePath) => {
  const winner = await Winner.findById(winnerId);
  if (!winner) {
    throw { statusCode: 404, message: 'Winner record not found' };
  }
  
  if (winner.userId.toString() !== userId.toString()) {
    throw { statusCode: 403, message: 'Not authorized' };
  }
  
  winner.proofUrl = filePath;
  winner.paymentStatus = 'pending';
  await winner.save();
  return winner;
};

export const verifyWinner = async (winnerId, { action, adminNotes }) => {
  const winner = await Winner.findById(winnerId);
  if (!winner) {
    throw { statusCode: 404, message: 'Winner record not found' };
  }
  
  if (!['approve', 'reject', 'paid'].includes(action)) {
    throw { statusCode: 400, message: 'Invalid action' };
  }
  
  if (action === 'approve') {
    winner.paymentStatus = 'approved';
  } else if (action === 'reject') {
    winner.paymentStatus = 'rejected';
  } else if (action === 'paid') {
    winner.paymentStatus = 'paid';
    winner.paidAt = new Date();
  }
  
  if (adminNotes) {
    winner.adminNotes = adminNotes;
  }
  
  await winner.save();
  
  if (action === 'paid') {
    try {
      const updatedWinner = await Winner.findById(winner._id).populate('userId');
      await sendPaymentConfirmation(updatedWinner.userId, updatedWinner);
    } catch (emailError) {
      console.error('Payment confirmation email failed:', emailError.message);
    }
  }
  
  const updatedWinner = await Winner.findById(winner._id).populate('userId').populate('drawId');
  return updatedWinner;
};

export const getAllWinners = async ({ status, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  
  const query = {};
  if (status) {
    query.paymentStatus = status;
  }
  
  const winners = await Winner.find(query)
    .populate('userId')
    .populate('drawId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await Winner.countDocuments(query);
  
  return {
    winners,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
