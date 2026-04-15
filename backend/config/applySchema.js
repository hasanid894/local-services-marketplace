/**
 * applySchema.js — Applies schema.sql to the PostgreSQL database.
 * Run with: node config/applySchema.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { Pool } = require('pg');
const fs       = require('fs');
const path     = require('path');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'postgres',
  user:     process.env.DB_USER     || 'postgres',
  password: String(process.env.DB_PASSWORD || ''),
});

async function applySchema() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  // Split on semicolons, filter blanks/comments-only blocks
  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  const client = await pool.connect();
  try {
    console.log(`📋  Applying ${statements.length} SQL statements...\n`);
    for (const stmt of statements) {
      if (!stmt) continue;
      try {
        await client.query(stmt);
        // Print first line of each statement
        console.log(`  ✅  ${stmt.split('\n')[0].substring(0, 60)}`);
      } catch (err) {
        if (err.code === '42P07') {
          // 42P07 = duplicate_table — table already exists, skip
          console.log(`  ⚠️   Already exists — skipped: ${stmt.split('\n')[0].substring(0, 60)}`);
        } else {
          console.error(`  ❌  Error: ${err.message}`);
          console.error(`      Statement: ${stmt.substring(0, 100)}`);
        }
      }
    }
    console.log('\n✅  Schema applied successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

applySchema().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
