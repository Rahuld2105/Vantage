import * as authService from '../services/auth.service.js';
import { success, error } from '../utils/apiResponse.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    success(res, result, 'User registered successfully', 201);
  } catch (err) {
    error(res, err.message, err.statusCode || 500);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    success(res, result, 'Logged in successfully');
  } catch (err) {
    error(res, err.message, err.statusCode || 500);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user._id);
    success(res, user, 'User retrieved');
  } catch (err) {
    error(res, err.message, err.statusCode || 500);
  }
};
