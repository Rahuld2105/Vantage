import mongoose from 'mongoose';

const verificationEventSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ['proof_uploaded', 'approved', 'rejected', 'paid'],
      required: true,
    },
    at: {
      type: Date,
      default: Date.now,
    },
    byUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: String,
  },
  { _id: false }
);

const winnerSchema = new mongoose.Schema(
  {
    drawId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Draw',
      required: [true, 'Draw ID is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    tier: {
      type: String,
      enum: ['5-match', '4-match', '3-match'],
      required: [true, 'Tier is required'],
    },
    prizeAmount: {
      type: Number,
      required: [true, 'Prize amount is required'],
      min: 0,
    },
    proofUrl: String,
    proofUploadedAt: Date,
    paymentStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid'],
      default: 'pending',
    },
    approvedAt: Date,
    rejectedAt: Date,
    paidAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    adminNotes: String,
    verificationHistory: {
      type: [verificationEventSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Winner = mongoose.model('Winner', winnerSchema);

export default Winner;
