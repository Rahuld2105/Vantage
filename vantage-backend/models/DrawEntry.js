import mongoose from 'mongoose';

const drawEntrySchema = new mongoose.Schema(
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
    scores: {
      type: [Number],
      required: true,
    },
    matchCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    tier: {
      type: String,
      enum: ['5-match', '4-match', '3-match', null],
      default: null,
    },
  },
  { timestamps: true }
);

drawEntrySchema.index({ drawId: 1, userId: 1 }, { unique: true });

const DrawEntry = mongoose.model('DrawEntry', drawEntrySchema);

export default DrawEntry;
