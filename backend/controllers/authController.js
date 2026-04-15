require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { createUserRepository } = require('../repositories/UserRepository');
const AuthService              = require('../services/AuthService');

const userRepo   = createUserRepository();
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
