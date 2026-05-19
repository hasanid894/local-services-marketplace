/**
 * migratePhoneField.js
 * Run with: node config/migratePhoneField.js
 *
 * Adds an optional `phone` VARCHAR(30) column to the users table.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { pool } = require('./db');

(async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS phone VARCHAR(30) DEFAULT NULL
    `);
    console.log('✅  phone column added to users (or already existed).');
  } catch (err) {
    console.error('❌  Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
