import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import Charity from '../models/Charity.js';
import Draw from '../models/Draw.js';
import Winner from '../models/Winner.js';
import Score from '../models/Score.js';
import * as winnerService from '../services/winner.service.js';
import { success, error } from '../utils/apiResponse.js';

export const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const publishedDraws = await Draw.countDocuments({ status: 'published' });

    const charities = await Charity.find({});
    const totalCharityRaised = charities.reduce((sum, charity) => sum + (charity.raised || 0), 0);

    const publishedDrawDocs = await Draw.find({ status: 'published' }).select('totalPool');
    const totalPrizePool = publishedDrawDocs.reduce((sum, draw) => sum + (draw.totalPool || 0), 0);
    const averagePrizePool = publishedDrawDocs.length ? totalPrizePool / publishedDrawDocs.length : 0;

    const paidWinners = await Winner.countDocuments({ paymentStatus: 'paid' });
    const pendingWinners = await Winner.countDocuments({ paymentStatus: 'pending' });

    const drawStats = await Draw.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: null,
          randomDraws: {
            $sum: {
              $cond: [{ $eq: ['$logic', 'random'] }, 1, 0],
            },
          },
          algorithmicDraws: {
            $sum: {
              $cond: [{ $eq: ['$logic', 'algorithmic'] }, 1, 0],
            },
          },
          rolloverMonths: {
            $sum: {
              $cond: [{ $eq: ['$hadFiveMatch', false] }, 1, 0],
            },
          },
          biggestJackpot: { $max: '$pools.fiveMatch' },
        },
      },
    ]);

    const tierBreakdown = await Winner.aggregate([
      {
        $group: {
          _id: '$tier',
          winners: { $sum: 1 },
          totalPaidOut: { $sum: '$prizeAmount' },
        },
      },
    ]);

    success(res, {
      totalUsers,
      activeSubscriptions,
      totalCharityRaised,
      totalPrizePool,
      averagePrizePool,
      publishedDraws,
      paidWinners,
      pendingWinners,
      drawStats: drawStats[0] || {
        randomDraws: 0,
        algorithmicDraws: 0,
        rolloverMonths: 0,
        biggestJackpot: 0,
      },
      tierBreakdown,
    }, 'Stats retrieved');
  } catch (err) {
    error(res, 'Failed to retrieve stats', 500);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const skip = (page - 1) * limit;
    const query = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const subscriptions = await Subscription.find({ userId: { $in: users.map((user) => user._id) } }).populate('charityId');
    const subscriptionMap = new Map(subscriptions.map((subscription) => [subscription.userId.toString(), subscription]));

    const total = await User.countDocuments(query);

    success(res, {
      users: users.map((user) => ({
        ...user.toObject(),
        subscription: subscriptionMap.get(user._id.toString()) || null,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }, 'Users retrieved');
  } catch (err) {
    error(res, 'Failed to retrieve users', 500);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive, charityId, charityPercent } = req.body;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const update = {};
    if (typeof name === 'string' && name.trim()) update.name = name.trim();
    if (typeof email === 'string' && email.trim()) {
      if (!emailPattern.test(email.trim())) {
        return error(res, 'Please provide a valid email address', 400);
      }
      const existingUser = await User.findOne({ email: email.trim(), _id: { $ne: id } });
      if (existingUser) {
        return error(res, 'Email already in use', 400);
      }
      update.email = email.trim();
    }
    if (typeof role === 'string') update.role = role;
    if (typeof isActive === 'boolean') update.isActive = isActive;
    if (charityId) update.charityId = charityId;
    if (typeof charityPercent === 'number') update.charityPercent = charityPercent;

    const user = await User.findByIdAndUpdate(
      id,
      update,
      { new: true }
    ).populate('charityId');

    if (!user) {
      return error(res, 'User not found', 404);
    }

    if (charityId || typeof charityPercent === 'number') {
      await Subscription.findOneAndUpdate(
        { userId: id },
        {
          ...(charityId && { charityId }),
          ...(typeof charityPercent === 'number' && { charityPercent }),
        }
      );
    }

    success(res, user, 'User updated');
  } catch (err) {
    error(res, err.message || 'Failed to update user', 500);
  }
};

export const getSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({})
      .populate('userId')
      .populate('charityId')
      .sort({ createdAt: -1 });

    success(res, subscriptions, 'Subscriptions retrieved');
  } catch (err) {
    error(res, 'Failed to retrieve subscriptions', 500);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, cancelAtPeriodEnd } = req.body;

    const subscription = await Subscription.findByIdAndUpdate(
      id,
      { status, cancelAtPeriodEnd },
      { new: true }
    ).populate('userId').populate('charityId');

    success(res, subscription, 'Subscription updated');
  } catch (err) {
    error(res, 'Failed to update subscription', 500);
  }
};

export const getUserScores = async (req, res, next) => {
  try {
    const scores = await Score.find({ userId: req.params.id }).sort({ date: -1 }).limit(5);
    success(res, scores, 'Scores retrieved');
  } catch (err) {
    error(res, 'Failed to retrieve scores', 500);
  }
};

export const replaceUserScores = async (req, res, next) => {
  try {
    const { id } = req.params;
    const scores = Array.isArray(req.body.scores) ? req.body.scores : [];

    await Score.deleteMany({ userId: id });
    await Score.insertMany(
      scores
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map((score) => ({
          userId: id,
          value: score.value,
          date: score.date,
        }))
    );

    const updatedScores = await Score.find({ userId: id }).sort({ date: -1 }).limit(5);
    success(res, updatedScores, 'Scores updated');
  } catch (err) {
    error(res, 'Failed to update scores', 500);
  }
};

export const getAllWinners = async (req, res, next) => {
  try {
    const status = req.query.status;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await winnerService.getAllWinners({ status, page, limit });
    success(res, result, 'Winners retrieved');
  } catch (err) {
    error(res, 'Failed to retrieve winners', 500);
  }
};

export const verifyWinner = async (req, res, next) => {
  try {
    const { winnerId } = req.params;
    const { action, adminNotes } = req.body;

    const winner = await winnerService.verifyWinner(winnerId, {
      action,
      adminNotes,
      adminUserId: req.user._id,
    });
    success(res, winner, 'Winner verified');
  } catch (err) {
    error(res, err.message || 'Failed to verify winner', err.statusCode || 500);
  }
};
