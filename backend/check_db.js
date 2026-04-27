require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Pool } = require('pg');
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'postgres',
  user:     process.env.DB_USER     || 'postgres',
  password: String(process.env.DB_PASSWORD || ''),
});

async function main() {
  // 1. List tables
  const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log('\n=== TABLES ===');
  tables.rows.forEach(t => console.log(' -', t.table_name));

  // 2. Users
  const users = await pool.query('SELECT id, email, role, LEFT(password_hash, 10) AS pw_prefix FROM users');
  console.log('\n=== USERS ===');
  users.rows.forEach(u => console.log(` id=${u.id} email=${u.email} role=${u.role} pw_prefix=${u.pw_prefix}`));

  // 3. Services (all, ignoring is_active)
  const services = await pool.query('SELECT id, title, is_active, provider_id, category_id FROM services');
  console.log('\n=== SERVICES ===');
  if (services.rows.length === 0) console.log('  (empty)');
  services.rows.forEach(s => console.log(` id=${s.id} title=${s.title} is_active=${s.is_active} provider_id=${s.provider_id} category_id=${s.category_id}`));

  // 4. Reviews
  const reviews = await pool.query('SELECT id, user_id, provider_id, booking_id, rating FROM reviews');
  console.log('\n=== REVIEWS ===');
  if (reviews.rows.length === 0) console.log('  (empty)');
  reviews.rows.forEach(r => console.log(` id=${r.id} user_id=${r.user_id} provider_id=${r.provider_id} booking_id=${r.booking_id} rating=${r.rating}`));

  // 5. Bookings
  const bookings = await pool.query('SELECT id, user_id, service_id, provider_id, status FROM bookings');
  console.log('\n=== BOOKINGS ===');
  if (bookings.rows.length === 0) console.log('  (empty)');
  bookings.rows.forEach(b => console.log(` id=${b.id} user_id=${b.user_id} service_id=${b.service_id} provider_id=${b.provider_id} status=${b.status}`));

  // 6. Categories
  const cats = await pool.query('SELECT id, name FROM categories');
  console.log('\n=== CATEGORIES ===');
  if (cats.rows.length === 0) console.log('  (empty)');
  cats.rows.forEach(c => console.log(` id=${c.id} name=${c.name}`));

  await pool.end();
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
