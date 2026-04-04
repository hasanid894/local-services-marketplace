const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'local-services-marketplace-secret-key';
const JWT_EXPIRES_IN = '7d';

/**
 * AuthService - Logjika e biznesit për autentikimin.
 *
 * SOLID: Single Responsibility Principle (SRP)
 * - Merret VETËM me regjistrim dhe login të përdoruesve.
 *
 * SOLID: Dependency Inversion Principle (DIP)
 * - Varet nga IRepository (abstrakti) për aksesin te Users.
 */
class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Regjistro një përdorues të ri.
   * @param {object} param0 - { name, email, password, role, location }
   * @returns {{ user, token }}
   */
  async register({ name, email, password, role = 'Customer', location = '' }) {
    if (!name || !name.trim()) throw new Error('Name is required.');
    if (!email || !email.trim()) throw new Error('Email is required.');
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');

    // Check for duplicate email
    const existing = this.userRepository.getAll().find(u => u.email === email.trim());
    if (existing) throw new Error('Email already registered.');

    const allowedRoles = ['Customer', 'Provider', 'Admin'];
    const normalizedRole = allowedRoles.find(r => r.toLowerCase() === String(role).toLowerCase()) || 'Customer';

    const passwordHash = await bcrypt.hash(password, 10);

    const User = require('../models/User');
    const user = new User(null, name.trim(), email.trim(), passwordHash, normalizedRole, location);
    const saved = this.userRepository.add(user);

    const token = jwt.sign(
      { id: saved.id, email: saved.email, role: saved.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Don't return the password hash to the client
    const { passwordHash: _omit, ...safeUser } = saved;
    return { user: safeUser, token };
  }

  /**
   * Kryej login me email dhe password.
   * @param {object} param0 - { email, password }
   * @returns {{ user, token }}
   */
  async login({ email, password }) {
    if (!email || !password) throw new Error('Email and password are required.');

    const user = this.userRepository.getAll().find(u => u.email === email.trim());
    if (!user) throw new Error('Invalid email or password.');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Invalid email or password.');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { passwordHash: _omit, ...safeUser } = user;
    return { user: safeUser, token };
  }

  /**
   * Verifiko një JWT token dhe kthe payload-in.
   * @param {string} token
   * @returns {object} payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      throw new Error('Invalid or expired token.');
    }
  }
}

module.exports = AuthService;
