const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('FATAL: JWT_SECRET environment variable is not set. Add it to your .env file.');

/**
 * verifyToken — Real JWT authentication middleware.
 *
 * Reads the Authorization: Bearer <token> header, verifies the token,
 * and attaches the decoded payload to req.user.
 * Sends 401 if token is missing or invalid.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
}

/**
 * attachDemoUser — Fallback for public routes.
 *
 * If a valid Bearer token is present, decodes it and populates req.user.
 * Otherwise defaults to guest/customer — does NOT block the request.
 * Used for routes that are readable without auth but write-restricted.
 */
function attachDemoUser(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = { id: payload.id, email: payload.email, role: payload.role };
      return next();
    } catch {
      // Invalid token — fall through to guest
    }
  }

  // No token or invalid → guest customer (read-only access)
  req.user = { id: 0, role: 'customer' };
  next();
}

/**
 * requireRole(...roles) — Authorization middleware.
 *
 * Call after verifyToken or attachDemoUser.
 * Sends 403 if the current user's role is not in the allowed list.
 */
function requireRole(...roles) {
  const normalized = roles.map(r => String(r).toLowerCase());
  return (req, res, next) => {
    const currentRole = String(req.user?.role || 'customer').toLowerCase();
    if (!normalized.includes(currentRole)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions.' });
    }
    next();
  };
}

module.exports = { verifyToken, attachDemoUser, requireRole };
