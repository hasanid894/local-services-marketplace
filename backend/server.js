// Load env vars FIRST — before any other require that might read process.env
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const app = require('./app');
const errorHandler = require('./middleware/errorHandler');

// Routes
// Rate limiter applied to auth endpoints to prevent brute-force attacks (Weakness 5 fix)
const authLimiter = app.get('authLimiter');
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Error handling middleware (must be last)
app.use(errorHandler);

// ── Startup ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const USE_DB = process.env.USE_DB === 'true';

async function start() {
  if (USE_DB) {
    const { pool } = require('./config/db');
    try {
      const res = await pool.query('SELECT NOW() AS now');
      console.log(`✅  PostgreSQL connected (${res.rows[0].now})`);
    } catch (err) {
      console.error('❌  PostgreSQL connection failed:', err.message);
      console.error('    Check your .env DB_* variables and make sure PostgreSQL is running.');
      process.exit(1);   // Don't start the server with a broken DB connection
    }
  } else {
    console.log('📂  Running in CSV / file mode (USE_DB not set to "true").');
  }

  app.listen(PORT, () =>
    console.log(`🚀  Server running on port ${PORT} [${USE_DB ? 'PostgreSQL' : 'CSV'} mode]`)
  );
}

start();
