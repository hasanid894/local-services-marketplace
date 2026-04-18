require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// ── Security headers (Weakness 5 fix) ────────────────────────────────────────
// helmet() sets ~15 HTTP security headers:
//   X-Content-Type-Options: nosniff
//   X-Frame-Options: SAMEORIGIN
//   X-XSS-Protection: 0 (modern guidance — rely on CSP instead)
//   Strict-Transport-Security (HSTS)
//   Content-Security-Policy (basic defaults)
//   ...and more
app.use(helmet());

// ── CORS (Weakness 5 fix) ─────────────────────────────────────────────────────
// Restrict allowed origins instead of app.use(cors()) which permits any origin.
const ALLOWED_ORIGINS = [
  'http://localhost:3000', // React dev server
  'http://127.0.0.1:3000',
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, same-server requests)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' is not allowed.`));
    }
  },
  credentials: true,
}));

app.use(express.json());

// ── Rate limiting on auth endpoints (Weakness 5 fix) ─────────────────────────
// Limits each IP to 10 login/register requests per 15 minutes.
// Prevents brute-force password attacks.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,   // Return RateLimit-* headers
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait 15 minutes and try again.' },
});

// Apply only to auth routes — mounting done in server.js, but we export the
// limiter so server.js can apply it explicitly to /api/auth routes.
app.set('authLimiter', authLimiter);

module.exports = app;
