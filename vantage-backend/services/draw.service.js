import Draw from '../models/Draw.js';
import DrawEntry from '../models/DrawEntry.js';
import Winner from '../models/Winner.js';
import Subscription from '../models/Subscription.js';
import Score from '../models/Score.js';
import User from '../models/User.js';
import { generateRandomDraw, generateAlgorithmicDraw, countMatches, getTier } from '../utils/drawEngine.js';
import { calculatePools, splitPrize } from '../utils/prizeCalculator.js';
import { calculateMonthlyPool } from './subscription.service.js';
import { sendDrawResult, sendWinnerAlert } from './email.service.js';

export const getMonthKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export const getOrCreateDraft = async (month = getMonthKey()) => {
  let draw = await Draw.findOne({ month, status: 'draft' });
  if (!draw) {
    draw = new Draw({ month, logic: 'random', status: 'draft' });
    await draw.save();
  }
  return draw;
};

const getDrawNumbers = async (logic) => {
  if (logic === 'algorithmic') {
    const allScores = await Score.find({}).select('value');
    const scoreValues = allScores.map((score) => score.value);
    return generateAlgorithmicDraw(scoreValues);
  }

  return generateRandomDraw();
};

export const simulate = async (drawId, logic) => {
  const draw = await Draw.findById(drawId);
  if (!draw) {
    throw { statusCode: 404, message: 'Draw not found' };
  }

  const numbers = await getDrawNumbers(logic);
  const totalPool = await calculateMonthlyPool();

  let jackpotRollover = 0;
  const lastDraw = await Draw.findOne({ status: 'published' }).sort({ createdAt: -1 });
  if (lastDraw && !lastDraw.hadFiveMatch && lastDraw.pools.fiveMatch) {
    jackpotRollover = lastDraw.pools.fiveMatch;
  }

  const pools = calculatePools(totalPool, jackpotRollover);

  draw.numbers = numbers;
  draw.logic = logic;
  draw.totalPool = totalPool;
  draw.jackpotRollover = jackpotRollover;
  draw.pools = pools;
  draw.status = 'simulated';

  await draw.save();
  return draw;
};

export const publish = async (drawId) => {
  const draw = await Draw.findById(drawId);
  if (!draw || draw.status !== 'simulated') {
    throw { statusCode: 400, message: 'Draw must be in simulated state' };
  }

  const activeSubscriptions = await Subscription.find({ status: 'active' }).select('userId');
  const activeUserIds = activeSubscriptions.map((subscription) => subscription.userId);

  const fiveMatchWinners = [];
  const fourMatchWinners = [];
  const threeMatchWinners = [];

  for (const userId of activeUserIds) {
    const scores = await Score.find({ userId }).sort({ date: -1 }).limit(5);
    const scoreValues = scores.map((score) => score.value);

    const matchCount = countMatches(scoreValues, draw.numbers);
    const tier = getTier(matchCount);

    const entry = new DrawEntry({
      drawId,
      userId,
      scores: scoreValues,
      matchCount,
      tier,
    });
    await entry.save();

    if (tier === '5-match') {
      fiveMatchWinners.push(userId);
    } else if (tier === '4-match') {
      fourMatchWinners.push(userId);
    } else if (tier === '3-match') {
      threeMatchWinners.push(userId);
    }

    try {
      const user = await User.findById(userId);
      if (user) {
        await sendDrawResult(user, draw, matchCount);
      }
    } catch (emailError) {
      console.error('Draw result email failed:', emailError.message);
    }
  }

  const winners = [];

  if (fiveMatchWinners.length > 0) {
    const prize = splitPrize(draw.pools.fiveMatch, fiveMatchWinners.length);
    for (const userId of fiveMatchWinners) {
      const winner = new Winner({
        drawId,
        userId,
        tier: '5-match',
        prizeAmount: prize,
      });
      await winner.save();
      winners.push(winner);
    }
    draw.hadFiveMatch = true;
  }

  if (fourMatchWinners.length > 0) {
    const prize = splitPrize(draw.pools.fourMatch, fourMatchWinners.length);
    for (const userId of fourMatchWinners) {
      const winner = new Winner({
        drawId,
        userId,
        tier: '4-match',
        prizeAmount: prize,
      });
      await winner.save();
      winners.push(winner);
    }
  }

  if (threeMatchWinners.length > 0) {
    const prize = splitPrize(draw.pools.threeMatch, threeMatchWinners.length);
    for (const userId of threeMatchWinners) {
      const winner = new Winner({
        drawId,
        userId,
        tier: '3-match',
        prizeAmount: prize,
      });
      await winner.save();
      winners.push(winner);
    }
  }

  draw.status = 'published';
  draw.publishedAt = new Date();
  await draw.save();

  for (const winnerData of winners) {
    try {
      const winner = await Winner.findById(winnerData._id).populate('userId');
      await sendWinnerAlert(winner.userId, winner);
    } catch (emailError) {
      console.error('Winner alert email failed:', emailError.message);
    }
  }

  return draw;
};

export const runMonthlyDraw = async ({ logic = 'random', month = getMonthKey() } = {}) => {
  const existingPublished = await Draw.findOne({ month, status: 'published' });
  if (existingPublished) {
    return {
      draw: existingPublished,
      created: false,
      simulated: false,
      published: false,
      message: `Draw already published for ${month}`,
    };
  }

  let draw = await Draw.findOne({ month });
  const created = !draw;

  if (!draw) {
    draw = await getOrCreateDraft(month);
  }

  let simulated = false;
  if (draw.status === 'draft') {
    draw = await simulate(draw._id, logic);
    simulated = true;
  } else if (draw.status === 'simulated') {
    draw.logic = logic;
    await draw.save();
  }

  let published = false;
  if (draw.status === 'simulated') {
    draw = await publish(draw._id);
    published = true;
  }

  return {
    draw,
    created,
    simulated,
    published,
    message: published ? `Monthly draw published for ${month}` : `Draw already prepared for ${month}`,
  };
};

export const getDrawHistory = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const draws = await Draw.find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Draw.countDocuments({ status: 'published' });

  return {
    draws,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
