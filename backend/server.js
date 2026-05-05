// Load env vars FIRST — before any other require that might read process.env
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const errorHandler = require('./middleware/errorHandler');

// ── Startup ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function start() {
  let useDb = process.env.USE_DB === 'true';

  // If DB mode was requested but connection fails, gracefully fall back to CSV mode.
  // This keeps the app usable in local/dev environments.
  if (useDb) {
    const { pool } = require('./config/db');
    try {
      const res = await pool.query('SELECT NOW() AS now');
      console.log(`✅  PostgreSQL connected (${res.rows[0].now})`);
    } catch (err) {
      console.error('❌  PostgreSQL connection failed:', err.message);
      console.warn('↪️  Falling back to CSV mode (set USE_DB=false to silence this warning).');
      useDb = false;
      process.env.USE_DB = 'false';
    }
  } else {
    console.log('📂  Running in CSV / file mode (USE_DB not set to "true").');
  }

  // Require app/routes only after DB-vs-CSV mode is finalized,
  // so repository factories pick the right implementation.
  const app = require('./app');

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

  app.listen(PORT, () =>
    console.log(`🚀  Server running on port ${PORT} [${useDb ? 'PostgreSQL' : 'CSV'} mode]`)
  );
}

start();
