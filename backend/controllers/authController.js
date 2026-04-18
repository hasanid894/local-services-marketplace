/**
 * authController.js
 *
 * Handles POST /api/auth/register and POST /api/auth/login.
 *
 * Improvement (Weakness 2 — Dependency Injection):
 *   authService is now imported from container.js instead of being
 *   instantiated here. The controller has zero wiring code.
 *
 * Improvement (Weakness 7 — NotificationService connected):
 *   notificationService.notifyUserRegistered() is called after a
 *   successful registration so the service is no longer dead code.
 */

const { authService, notificationService } = require('../container');

/**
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    // Notify after successful registration (Weakness 7 fix)
    notificationService.notifyUserRegistered(result.user);
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
