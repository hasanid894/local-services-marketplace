/**
 * Adds platform features for user-story coverage: user suspension and favorites.
 * Run once: npm run db:migrate:user-stories
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { pool } = require('./db');

async function migrate() {
  const sql = `
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT FALSE;

    CREATE TABLE IF NOT EXISTS favorite_providers (
      user_id INT NOT NULL,
      provider_id INT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, provider_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
      CHECK (user_id <> provider_id)
    );
  `;
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('✅  users.is_suspended and favorite_providers table ensured.');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
