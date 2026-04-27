/**
 * checkDb.js — Diagnose exactly what tables are visible to the app's DB user.
 * Run with: node config/checkDb.js
 */
const { pool } = require('./db');

(async () => {
  try {
    console.log('\n🔌  Connecting to PostgreSQL...');
    console.log(`    host=${process.env.DB_HOST} port=${process.env.DB_PORT} db=${process.env.DB_NAME} user=${process.env.DB_USER}\n`);

    // 1. Check current schema search_path
    const sp = await pool.query('SHOW search_path');
    console.log('📍  search_path:', sp.rows[0].search_path);

    // 2. Check current database/user
    const cu = await pool.query('SELECT current_database(), current_user, current_schema()');
    console.log('📍  current_database:', cu.rows[0].current_database);
    console.log('📍  current_user    :', cu.rows[0].current_user);
    console.log('📍  current_schema  :', cu.rows[0].current_schema);

    // 3. List ALL tables visible to the current user across all schemas
    const allTables = await pool.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_type = 'BASE TABLE'
        AND table_schema NOT IN ('information_schema', 'pg_catalog')
      ORDER BY table_schema, table_name
    `);
    console.log(`\n📋  All visible tables (${allTables.rows.length}):`);
    allTables.rows.forEach(r => console.log(`    ${r.table_schema}.${r.table_name}`));

    // 4. Try direct SELECT from each expected table
    const targets = ['users', 'services', 'reviews', 'bookings', 'categories'];
    console.log('\n🧪  Direct query test:');
    for (const t of targets) {
      try {
        const r = await pool.query(`SELECT COUNT(*) FROM ${t}`);
        console.log(`    ✅  ${t}: ${r.rows[0].count} rows`);
      } catch (e) {
        console.log(`    ❌  ${t}: ${e.message}`);
      }
    }

  } catch (err) {
    console.error('Fatal connection error:', err.message);
  } finally {
    await pool.end();
    console.log('\nDone.\n');
  }
})();
