import * as charityService from '../services/charity.service.js';
import { success, error } from '../utils/apiResponse.js';

export const getAll = async (req, res, next) => {
  try {
    const { category, search, page, limit } = req.query;
    const result = await charityService.getAll({
      category,
      search,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    });
    success(res, result, 'Charities retrieved');
  } catch (err) {
    error(res, 'Failed to retrieve charities', 500);
  }
};

export const getById = async (req, res, next) => {
  try {
    const charity = await charityService.getById(req.params.id);
    success(res, charity, 'Charity retrieved');
  } catch (err) {
    error(res, err.message || 'Charity not found', err.statusCode || 404);
  }
};

export const create = async (req, res, next) => {
  try {
    const charity = await charityService.create(req.body);
    success(res, charity, 'Charity created', 201);
  } catch (err) {
    error(res, err.message || 'Failed to create charity', err.statusCode || 500);
  }
};

export const update = async (req, res, next) => {
  try {
    const charity = await charityService.update(req.params.id, req.body);
    success(res, charity, 'Charity updated');
  } catch (err) {
    error(res, err.message || 'Failed to update charity', err.statusCode || 500);
  }
};

export const remove = async (req, res, next) => {
  try {
    const charity = await charityService.remove(req.params.id);
    success(res, charity, 'Charity removed');
  } catch (err) {
    error(res, err.message || 'Failed to remove charity', err.statusCode || 500);
  }
};

export const donate = async (req, res, next) => {
  try {
    const donation = await charityService.createDonation(req.params.id, req.body);
    success(res, donation, 'Donation submitted', 201);
  } catch (err) {
    error(res, err.message || 'Failed to submit donation', err.statusCode || 500);
  }
};
