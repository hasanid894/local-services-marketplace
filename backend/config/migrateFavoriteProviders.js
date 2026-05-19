/**
 * migrateFavoriteProviders.js
 * Run with: node config/migrateFavoriteProviders.js
 *
 * Creates the favorite_providers table in PostgreSQL if it does not exist.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { pool } = require('./db');

(async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS favorite_providers (
        user_id     INT NOT NULL,
        provider_id INT NOT NULL,
        created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, provider_id),
        FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
        CHECK (user_id <> provider_id)
      )
    `);
    console.log('✅  favorite_providers table created (or already existed).');
  } catch (err) {
    console.error('❌  Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
