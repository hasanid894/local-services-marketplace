const path               = require('path');
const FileRepository     = require('./FileRepository');
const DatabaseRepository = require('./DatabaseRepository');
const User               = require('../models/User');
const { query }          = require('../config/db');

// ── Column mapping ───────────────────────────────────────────────────────────

/**
 * Map a DB snake_case row → JS camelCase plain object.
 * DB: id, name, email, password_hash, role, location,
 *     latitude, longitude, is_verified, created_at
 */
function mapRow(row) {
  return {
    id:           row.id,
    name:         row.name,
    email:        row.email,
    passwordHash: row.password_hash,
    role:         row.role,            // lowercase: 'customer'|'provider'|'admin'
    location:     row.location  || '',
    latitude:     row.latitude  ? parseFloat(row.latitude)  : null,
    longitude:    row.longitude ? parseFloat(row.longitude) : null,
    isVerified:   row.is_verified,
    createdAt:    row.created_at,
  };
}

const INSERT_COLS = [
  'name', 'email', 'password_hash', 'role',
  'location', 'latitude', 'longitude', 'is_verified',
];

function toDbRow(entity) {
  return [
    entity.name,
    entity.email,
    entity.passwordHash,
    (entity.role || 'customer').toLowerCase(),
    entity.location   || '',
    entity.latitude   ?? null,
    entity.longitude  ?? null,
    entity.isVerified ?? false,
  ];
}

// ── DB-backed repository ─────────────────────────────────────────────────────

class UserDatabaseRepository extends DatabaseRepository {
  constructor() {
    super('users', mapRow, INSERT_COLS, toDbRow);
  }

  /** Efficient single-row lookup by email — used by AuthService. */
  async findByEmail(email) {
    const res = await query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email.trim().toLowerCase()]
    );
    return res.rows.length ? mapRow(res.rows[0]) : null;
  }

  /** Override update to handle camelCase → snake_case translation. */
  async update(id, updatedData) {
    const colMap = {
      name:         'name',
      email:        'email',
      passwordHash: 'password_hash',
      role:         'role',
      location:     'location',
      latitude:     'latitude',
      longitude:    'longitude',
      isVerified:   'is_verified',
    };
    const sqlData = {};
    for (const [key, val] of Object.entries(updatedData)) {
      const col = colMap[key] || key;
      sqlData[col] = (key === 'role' && val) ? String(val).toLowerCase() : val;
    }
    return super.update(id, sqlData);
  }
}

// ── CSV-backed repository (FileRepository fallback) ──────────────────────────

class UserFileRepository extends FileRepository {
  constructor() {
    super(
      path.join(__dirname, '../data/csv/users.csv'),
      User.fromCSV,
      User.csvHeader
    );
  }

  /** Sync linear scan for CSV mode. */
  findByEmail(email) {
    return this.getAll().find(u => u.email === email.trim().toLowerCase()) || null;
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────

function createUserRepository() {
  return process.env.USE_DB === 'true'
    ? new UserDatabaseRepository()
    : new UserFileRepository();
}

module.exports = { createUserRepository, UserDatabaseRepository, UserFileRepository };
