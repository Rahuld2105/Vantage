import * as scoreService from '../services/score.service.js';
import { success, error } from '../utils/apiResponse.js';

export const getScores = async (req, res, next) => {
  try {
    const scores = await scoreService.getUserScores(req.user._id);
    success(res, scores, 'Scores retrieved');
  } catch (err) {
    error(res, 'Failed to retrieve scores', 500);
  }
};

export const addScore = async (req, res, next) => {
  try {
    const { value, date } = req.body;
    const scores = await scoreService.addScore(req.user._id, { value, date });
    success(res, scores, 'Score added', 201);
  } catch (err) {
    error(res, err.message || 'Failed to add score', 500);
  }
};

export const replaceScores = async (req, res, next) => {
  try {
    const { scores } = req.body;
    const updated = await scoreService.replaceScores(req.user._id, scores);
    success(res, updated, 'Scores replaced');
  } catch (err) {
    error(res, 'Failed to replace scores', 500);
  }
};
