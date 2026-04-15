/**
 * db.js — PostgreSQL connection pool.
 *
 * dotenv is loaded HERE (before Pool is created) so that env vars are
 * available regardless of whether this file is run directly or required
 * by another module before server.js/app.js has a chance to call dotenv.
 *
 * Usage:
 *   const { query } = require('../config/db');
 *   const result = await query('SELECT * FROM users WHERE id = $1', [id]);
 *
 * Self-test:
 *   node config/db.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'postgres',
  user:     process.env.DB_USER     || 'postgres',
  password: String(process.env.DB_PASSWORD || ''),
});

// Convenience wrapper — use this in all repositories
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };

// ─── Self-test when run directly ─────────────────────────────────────────────
if (require.main === module) {
  (async () => {
    try {
      const res = await pool.query('SELECT NOW() AS now');
      console.log('✅  PostgreSQL connected:', res.rows[0].now);
    } catch (err) {
      console.error('❌  PostgreSQL connection failed:', err.message);
    } finally {
      await pool.end();
    }
  })();
}
