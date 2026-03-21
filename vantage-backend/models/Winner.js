import mongoose from 'mongoose';

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
    paymentStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid'],
      default: 'pending',
    },
    paidAt: Date,
    adminNotes: String,
  },
  { timestamps: true }
);

const Winner = mongoose.model('Winner', winnerSchema);

export default Winner;
