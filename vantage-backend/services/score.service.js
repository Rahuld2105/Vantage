import Score from '../models/Score.js';

export const getUserScores = async (userId) => {
  const scores = await Score.find({ userId })
    .sort({ date: -1 })
    .limit(5);
  return scores;
};

export const addScore = async (userId, { value, date }) => {
  const existingScores = await Score.find({ userId })
    .sort({ date: -1 })
    .limit(5);
  
  if (existingScores.length >= 5) {
    const oldestScore = existingScores[existingScores.length - 1];
    await Score.deleteOne({ _id: oldestScore._id });
  }
  
  const newScore = new Score({
    userId,
    value,
    date,
  });
  
  await newScore.save();
  
  const updated = await getUserScores(userId);
  return updated;
};

export const replaceScores = async (userId, scores) => {
  await Score.deleteMany({ userId });
  
  const scoreDocs = scores
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
    .map(s => ({
      userId,
      value: s.value,
      date: s.date,
    }));
  
  await Score.insertMany(scoreDocs);
  
  const updated = await getUserScores(userId);
  return updated;
};
