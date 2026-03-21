import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    value: {
      type: Number,
      required: [true, 'Score value is required'],
      min: [1, 'Score must be between 1 and 45'],
      max: [45, 'Score must be between 1 and 45'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
  },
  { timestamps: true }
);

scoreSchema.index({ userId: 1, date: -1 });

const Score = mongoose.model('Score', scoreSchema);

export default Score;
