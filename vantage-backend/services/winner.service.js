import Winner from '../models/Winner.js';
import { sendPaymentConfirmation } from './email.service.js';
import { buildUploadUrl } from '../utils/storage.js';

const appendVerificationEvent = (winner, event) => {
  winner.verificationHistory = [...(winner.verificationHistory || []), event];
};

const decorateWinner = (winner) => {
  if (!winner) return winner;

  const data = winner.toObject ? winner.toObject() : winner;
  return {
    ...data,
    proofUrl: data.proofUrl ? buildUploadUrl(data.proofUrl) : data.proofUrl,
  };
};

export const getMyWinnings = async (userId) => {
  const winnings = await Winner.find({ userId }).populate('drawId');
  return winnings.map(decorateWinner);
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
  winner.proofUploadedAt = new Date();
  winner.paymentStatus = 'pending';
  appendVerificationEvent(winner, {
    action: 'proof_uploaded',
    at: new Date(),
    byUserId: userId,
  });

  await winner.save();
  return winner;
};

export const verifyWinner = async (winnerId, { action, adminNotes, adminUserId }) => {
  const winner = await Winner.findById(winnerId);
  if (!winner) {
    throw { statusCode: 404, message: 'Winner record not found' };
  }

  if (!['approve', 'reject', 'paid'].includes(action)) {
    throw { statusCode: 400, message: 'Invalid action' };
  }

  if ((action === 'approve' || action === 'reject') && !winner.proofUrl) {
    throw { statusCode: 400, message: 'Winner proof must be uploaded before review' };
  }

  if (action === 'paid' && winner.paymentStatus !== 'approved') {
    throw { statusCode: 400, message: 'Winner must be approved before marking as paid' };
  }

  if (action === 'approve') {
    winner.paymentStatus = 'approved';
    winner.approvedAt = new Date();
    winner.rejectedAt = undefined;
  } else if (action === 'reject') {
    winner.paymentStatus = 'rejected';
    winner.rejectedAt = new Date();
  } else if (action === 'paid') {
    winner.paymentStatus = 'paid';
    winner.paidAt = new Date();
  }

  winner.verifiedBy = adminUserId;

  if (adminNotes) {
    winner.adminNotes = adminNotes;
  }

  appendVerificationEvent(winner, {
    action: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'paid',
    at: new Date(),
    byUserId: adminUserId,
    notes: adminNotes,
  });

  await winner.save();

  if (action === 'paid') {
    try {
      const updatedWinner = await Winner.findById(winner._id).populate('userId');
      await sendPaymentConfirmation(updatedWinner.userId, updatedWinner);
    } catch (emailError) {
      console.error('Payment confirmation email failed:', emailError.message);
    }
  }

  const updatedWinner = await Winner.findById(winner._id)
    .populate('userId')
    .populate('drawId')
    .populate('verifiedBy');

  return decorateWinner(updatedWinner);
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
    .populate('verifiedBy')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Winner.countDocuments(query);

  return {
    winners: winners.map(decorateWinner),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
