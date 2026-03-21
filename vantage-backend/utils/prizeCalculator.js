export const POOL_SHARES = {
  '5-match': 0.40,
  '4-match': 0.35,
  '3-match': 0.25,
};

export const calculatePools = (totalPool, jackpotRollover = 0) => {
  const pools = {
    fiveMatch: (totalPool * POOL_SHARES['5-match']) + jackpotRollover,
    fourMatch: totalPool * POOL_SHARES['4-match'],
    threeMatch: totalPool * POOL_SHARES['3-match'],
  };
  return pools;
};

export const splitPrize = (tierPool, winnerCount) => {
  if (winnerCount === 0) return 0;
  const prize = tierPool / winnerCount;
  return Math.floor(prize * 100) / 100;
};
