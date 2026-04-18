/**
 * authService.test.js
 *
 * Tests for AuthService — registration and login business logic.
 * Uses an in-memory user repository stub (no real DB or bcrypt salt rounds
 * are kept low via an env var mock to keep tests fast).
 *
 * Covers:
 *   - register() happy path
 *   - register() with missing / short fields
 *   - register() with a duplicate email
 *   - register() with an admin role (should be silently downgraded to customer)
 *   - login() happy path
 *   - login() with a wrong password
 *   - login() with a non-existent email
 */

// AuthService reads JWT_SECRET at module load time.
// We must set it before requiring the module.
process.env.JWT_SECRET = 'test-secret-key-for-jest';

const AuthService = require('../services/AuthService');

// ─── In-memory user repository stub ─────────────────────────────────────────
class InMemoryUserRepository {
  constructor() {
    this._users = [];
    this._counter = 1;
  }

  async add(user) {
    const record = { ...user, id: this._counter++ };
    this._users.push(record);
    return { ...record };
  }

  async findByEmail(email) {
    return this._users.find(u => u.email === email) || null;
  }

  async getById(id) {
    return this._users.find(u => u.id === id) || null;
  }
}

function makeAuthService() {
  return new AuthService(new InMemoryUserRepository());
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1 — register() — happy path
// ═══════════════════════════════════════════════════════════════════════════════
test('register() with valid data returns a user object and a JWT token', async () => {
  const auth = makeAuthService();
  const { user, token } = await auth.register({
    name: 'Alice Smith',
    email: 'alice@example.com',
    password: 'securePass123',
    role: 'customer',
  });

  expect(user).toBeDefined();
  expect(user.id).toBeDefined();
  expect(user.email).toBe('alice@example.com');
  expect(user.role).toBe('customer');
  // passwordHash must NOT be returned in the safe user object
  expect(user.passwordHash).toBeUndefined();
  expect(typeof token).toBe('string');
  expect(token.split('.').length).toBe(3); // valid JWT has 3 parts
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2 — register() — name too short
// ═══════════════════════════════════════════════════════════════════════════════
test('register() with a 1-character name throws a validation error', async () => {
  const auth = makeAuthService();
  await expect(
    auth.register({ name: 'A', email: 'a@example.com', password: 'password123' })
  ).rejects.toThrow('Name must be at least 2 characters.');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3 — register() — missing email
// ═══════════════════════════════════════════════════════════════════════════════
test('register() without an email throws "Email is required"', async () => {
  const auth = makeAuthService();
  await expect(
    auth.register({ name: 'Bob', email: '', password: 'password123' })
  ).rejects.toThrow('Email is required.');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4 — register() — password too short
// ═══════════════════════════════════════════════════════════════════════════════
test('register() with a 5-character password throws a validation error', async () => {
  const auth = makeAuthService();
  await expect(
    auth.register({ name: 'Bob', email: 'bob@example.com', password: '12345' })
  ).rejects.toThrow('Password must be at least 6 characters.');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5 — register() — duplicate email
// ═══════════════════════════════════════════════════════════════════════════════
test('register() with an already-registered email throws "Email already registered"', async () => {
  const auth = makeAuthService();
  await auth.register({ name: 'Carol', email: 'carol@example.com', password: 'password123' });

  await expect(
    auth.register({ name: 'Carol 2', email: 'carol@example.com', password: 'otherPass99' })
  ).rejects.toThrow('Email already registered.');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6 — register() — admin role is silently downgraded to customer
// ═══════════════════════════════════════════════════════════════════════════════
test('register() with role="admin" silently assigns role "customer" instead', async () => {
  const auth = makeAuthService();
  const { user } = await auth.register({
    name: 'David',
    email: 'david@example.com',
    password: 'password123',
    role: 'admin', // should be blocked
  });

  // Admin self-registration must not be allowed
  expect(user.role).toBe('customer');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7 — login() — happy path
// ═══════════════════════════════════════════════════════════════════════════════
test('login() with correct credentials returns user and token', async () => {
  const auth = makeAuthService();
  await auth.register({ name: 'Eve', email: 'eve@example.com', password: 'mypassword' });

  const { user, token } = await auth.login({ email: 'eve@example.com', password: 'mypassword' });

  expect(user.email).toBe('eve@example.com');
  expect(user.passwordHash).toBeUndefined();
  expect(typeof token).toBe('string');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8 — login() — wrong password
// ═══════════════════════════════════════════════════════════════════════════════
test('login() with a wrong password throws "Invalid email or password"', async () => {
  const auth = makeAuthService();
  await auth.register({ name: 'Frank', email: 'frank@example.com', password: 'correctPass' });

  await expect(
    auth.login({ email: 'frank@example.com', password: 'wrongPass' })
  ).rejects.toThrow('Invalid email or password.');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9 — login() — non-existent email
// ═══════════════════════════════════════════════════════════════════════════════
test('login() with an unregistered email throws "Invalid email or password"', async () => {
  const auth = makeAuthService();
  await expect(
    auth.login({ email: 'nobody@example.com', password: 'somePass' })
  ).rejects.toThrow('Invalid email or password.');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10 — login() — missing credentials
// ═══════════════════════════════════════════════════════════════════════════════
test('login() without email or password throws a validation error', async () => {
  const auth = makeAuthService();
  await expect(
    auth.login({ email: '', password: '' })
  ).rejects.toThrow('Email and password are required.');
});
