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
 * GET /api/users/public/providers/:id — public storefront profile shell
 */
exports.getPublicProviderProfile = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ error: 'Invalid provider id.' });
    const r = await query(
      `
      SELECT u.id, u.name, u.role, u.location,
        rv.avg_rating AS avg_rating,
        rv.rc AS review_count
      FROM users u
      LEFT JOIN (
        SELECT provider_id, AVG(rating)::double precision AS avg_rating, COUNT(*)::int AS rc
        FROM reviews GROUP BY provider_id
      ) rv ON rv.provider_id = u.id
      WHERE u.id = $1 AND LOWER(u.role) = 'provider'
      `,
      [id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Provider not found.' });
    const row = r.rows[0];
    res.json({
      id:          row.id,
      name:        row.name,
      location:    row.location || '',
      avgRating:   row.avg_rating != null ? Number(Number(row.avg_rating).toFixed(2)) : null,
      reviewCount: row.review_count != null ? Number(row.review_count) : 0,
    });
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
    const targetId = Number(req.params.id);
    const admin    = String(req.user.role || '').toLowerCase() === 'admin';
    if (!admin && Number(req.user.id) !== targetId) {
      return res.status(403).json({ error: 'You can view only your own profile.' });
    }
    const user = await userService.getUserById(targetId);
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
    const targetId = Number(req.params.id);
    const admin    = String(req.user.role || '').toLowerCase() === 'admin';
    const self     = Number(req.user.id) === targetId;

    if (!admin && !self) {
      return res.status(403).json({ error: 'You can update only your own profile.' });
    }

    const body = req.body || {};
    /** @type {Record<string, unknown>} */
    const updates = {};

    if (admin) {
      if (body.name !== undefined)         updates.name         = String(body.name).trim();
      if (body.email !== undefined)        updates.email        = String(body.email).trim().toLowerCase();
      if (body.role !== undefined)         updates.role         = String(body.role).toLowerCase();
      if (body.location !== undefined)       updates.location     = String(body.location || '').trim();
      if (body.latitude !== undefined)     updates.latitude     = body.latitude;
      if (body.longitude !== undefined)    updates.longitude    = body.longitude;
      if (body.phone !== undefined)        updates.phone        = body.phone ? String(body.phone).trim() : null;
      if (body.isVerified !== undefined)   updates.isVerified   = Boolean(body.isVerified);
      if (body.isSuspended !== undefined) updates.isSuspended = Boolean(body.isSuspended);
    } else if (self) {
      if (body.name !== undefined)     updates.name     = String(body.name).trim();
      if (body.location !== undefined) updates.location = String(body.location || '').trim();
      if (body.phone !== undefined)    updates.phone    = body.phone ? String(body.phone).trim() : null;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid profile fields supplied.' });
    }

    if (admin && updates.isSuspended === true && targetId === Number(req.user.id)) {
      return res.status(400).json({ error: 'You cannot suspend your own administrator account through this action.' });
    }

    const updated = await userService.updateUser(targetId, updates);
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
    const targetId = Number(req.params.id);
    if (Number(req.user.id) === targetId) {
      return res.status(400).json({ error: 'You cannot delete the account you are signed in as.' });
    }
    const result = await userService.deleteUser(targetId);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
