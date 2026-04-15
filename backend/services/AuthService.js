const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('FATAL: JWT_SECRET environment variable is not set. Add it to your .env file.');
const JWT_EXPIRES_IN = '7d';

/**
 * AuthService — Authentication business logic.
 * Fully async; uses findByEmail() for efficient DB lookup.
 * Roles are stored lowercase in the DB: 'customer' | 'provider' | 'admin'
 */
class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Register a new user.
   * @param {{ name, email, password, role, location, latitude, longitude }} body
   * @returns {{ user, token }}
   */
  async register({ name, email, password, role = 'customer', location = '', latitude = null, longitude = null }) {
    if (!name    || name.trim().length < 2) throw new Error('Name must be at least 2 characters.');
    if (!email   || !email.trim())          throw new Error('Email is required.');
    if (!password || password.length < 6)   throw new Error('Password must be at least 6 characters.');

    const normalizedEmail = email.trim().toLowerCase();

    // Efficient email lookup (SQL LIMIT 1 in DB mode, linear scan in CSV mode)
    const existing = await this.userRepository.findByEmail(normalizedEmail);
    if (existing) throw new Error('Email already registered.');

    // Only 'customer' and 'provider' can be self-registered.
    // Admin accounts must be assigned directly in the database.
    const SELF_REGISTERABLE = ['customer', 'provider'];
    const normalizedRole = SELF_REGISTERABLE.includes(String(role).toLowerCase())
      ? String(role).toLowerCase()
      : 'customer';

    const passwordHash = await bcrypt.hash(password, 10);

    const saved = await this.userRepository.add({
      name:      name.trim(),
      email:     normalizedEmail,
      passwordHash,
      role:      normalizedRole,
      location:  location || '',
      latitude:  latitude  ?? null,
      longitude: longitude ?? null,
      isVerified: false,
    });

    const token = this._signToken(saved);
    const { passwordHash: _omit, ...safeUser } = saved;
    return { user: safeUser, token };
  }

  /**
   * Login with email + password.
   * @param {{ email, password }} body
   * @returns {{ user, token }}
   */
  async login({ email, password }) {
    if (!email || !password) throw new Error('Email and password are required.');

    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) throw new Error('Invalid email or password.');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Invalid email or password.');

    const token = this._signToken(user);
    const { passwordHash: _omit, ...safeUser } = user;
    return { user: safeUser, token };
  }

  /** Sign a JWT for the given user object. */
  _signToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  /** Verify a JWT and return its payload. */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      throw new Error('Invalid or expired token.');
    }
  }
}

module.exports = AuthService;
