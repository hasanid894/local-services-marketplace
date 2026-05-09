/**
 * Adds job-site fields to `bookings` for existing PostgreSQL databases.
 * Run once: npm run db:migrate:booking-job-details
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { pool } = require('./db');

async function migrate() {
  const sql = `
    ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS job_address TEXT,
      ADD COLUMN IF NOT EXISTS job_city VARCHAR(120),
      ADD COLUMN IF NOT EXISTS preferred_time VARCHAR(20),
      ADD COLUMN IF NOT EXISTS customer_notes TEXT,
      ADD COLUMN IF NOT EXISTS access_notes TEXT;
  `;
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('✅  bookings: job_address, job_city, preferred_time, customer_notes, access_notes ensured.');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
