import mongoose from 'mongoose';

const charitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Charity name is required'],
      unique: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Water', 'Education', 'Health', 'Food', 'Environment'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    impact: String,
    raised: {
      type: Number,
      default: 0,
      min: 0,
    },
    imageUrl: String,
    events: [
      {
        title: String,
        location: String,
        date: Date,
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Charity = mongoose.model('Charity', charitySchema);

export default Charity;
