const { createUserRepository } = require('../repositories/UserRepository');
const UserService              = require('../services/UserService');

const repo    = createUserRepository();
const service = new UserService(repo);

/**
 * GET /api/users
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await service.getAllUsers();
    // Strip password hashes before responding
    res.json(users.map(({ passwordHash: _omit, ...u }) => u));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/users/:id
 */
exports.getUser = async (req, res) => {
  try {
    const user = await service.getUserById(Number(req.params.id));
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const { passwordHash: _omit, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/users
 */
exports.createUser = async (req, res) => {
  try {
    const user = await service.createUser(req.body);
    const { passwordHash: _omit, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * PUT /api/users/:id
 */
exports.updateUser = async (req, res) => {
  try {
    const updated = await service.updateUser(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: 'User not found.' });
    const { passwordHash: _omit, ...safeUser } = updated;
    res.json(safeUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * DELETE /api/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const result = await service.deleteUser(Number(req.params.id));
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
