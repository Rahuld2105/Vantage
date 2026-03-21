import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    plan: {
      type: String,
      enum: ['catalyst', 'architect', 'foundational'],
      required: [true, 'Plan is required'],
    },
    billing: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: [true, 'Billing period is required'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'past_due'],
      default: 'active',
    },
    charityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Charity',
    },
    charityPercent: {
      type: Number,
      min: 10,
      max: 50,
      required: true,
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
