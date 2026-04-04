const path = require('path');
const FileRepository = require('../repositories/FileRepository');
const AuthService = require('../services/AuthService');
const User = require('../models/User');

const userRepo = new FileRepository(
  path.join(__dirname, '../data/csv/users.csv'),
  User.fromCSV,
  User.csvHeader
);

const authService = new AuthService(userRepo);

/**
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
