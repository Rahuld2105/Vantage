import mongoose from 'mongoose';

const drawSchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: [true, 'Month is required'],
      unique: true,
      match: /^\d{4}-\d{2}$/,
    },
    numbers: {
      type: [Number],
      required: [true, 'Draw numbers are required'],
      validate: {
        validator: (v) => v.length === 5,
        message: 'Must contain exactly 5 numbers',
      },
    },
    logic: {
      type: String,
      enum: ['random', 'algorithmic'],
      required: true,
    },
    totalPool: {
      type: Number,
      default: 0,
    },
    jackpotRollover: {
      type: Number,
      default: 0,
    },
    pools: {
      fiveMatch: Number,
      fourMatch: Number,
      threeMatch: Number,
    },
    hadFiveMatch: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'simulated', 'published'],
      default: 'draft',
    },
    publishedAt: Date,
  },
  { timestamps: true }
);

const Draw = mongoose.model('Draw', drawSchema);

export default Draw;
