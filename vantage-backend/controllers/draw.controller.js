import * as drawService from '../services/draw.service.js';
import { success, error } from '../utils/apiResponse.js';

export const getDraftDraw = async (req, res, next) => {
  try {
    const draw = await drawService.getOrCreateDraft();
    success(res, draw, 'Draft draw retrieved');
  } catch (err) {
    error(res, 'Failed to retrieve draft', 500);
  }
};

export const simulate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { logic } = req.body;
    
    if (!['random', 'algorithmic'].includes(logic)) {
      return error(res, 'Invalid logic method', 400);
    }
    
    const draw = await drawService.simulate(id, logic);
    success(res, draw, 'Draw simulated');
  } catch (err) {
    error(res, err.message || 'Failed to simulate draw', err.statusCode || 500);
  }
};

export const publish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const draw = await drawService.publish(id);
    success(res, draw, 'Draw published');
  } catch (err) {
    error(res, err.message || 'Failed to publish draw', err.statusCode || 500);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await drawService.getDrawHistory(page, limit);
    success(res, result, 'Draw history retrieved');
  } catch (err) {
    error(res, 'Failed to retrieve history', 500);
  }
};
