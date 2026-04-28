/**
 * userController.js
 *
 * Handles all /api/users routes.
 *
 * Improvement (Weakness 2 — Dependency Injection):
 *   userService is now imported from container.js instead of being
 *   instantiated here. The controller has zero wiring code.
 */

const { userService } = require('../container');
const { query }       = require('../config/db');

/**
 * GET /api/users
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    // Strip password hashes before responding
    res.json(users.map(({ passwordHash: _omit, ...u }) => u));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/users/providers  — public, no auth required
 * Returns only { id, name } for every user with role = 'provider'.
 * Used by the Reviews page filter dropdown.
 */
exports.getProviders = async (req, res) => {
  try {
    const res2 = await query(
      "SELECT id, name FROM users WHERE role = 'provider' ORDER BY name"
    );
    res.json(res2.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/users/:id
 */
exports.getUser = async (req, res) => {
  try {
    const user = await userService.getUserById(Number(req.params.id));
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
    const user = await userService.createUser(req.body);
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
    const updated = await userService.updateUser(Number(req.params.id), req.body);
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
    const result = await userService.deleteUser(Number(req.params.id));
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
