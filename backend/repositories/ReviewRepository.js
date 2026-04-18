const path               = require('path');
const FileRepository     = require('./FileRepository');
const DatabaseRepository = require('./DatabaseRepository');
const Review             = require('../models/Review');
const { query }          = require('../config/db');

// ── Column mapping ───────────────────────────────────────────────────────────

/**
 * DB columns: id, user_id, provider_id, booking_id (UNIQUE),
 *             rating, comment, created_at
 */
function mapRow(row) {
  return {
    id:         row.id,
    userId:     row.user_id,
    providerId: row.provider_id,
    bookingId:  row.booking_id,
    rating:     row.rating,
    comment:    row.comment || '',
    createdAt:  row.created_at,
  };
}

const INSERT_COLS = [
  'user_id', 'provider_id', 'booking_id', 'rating', 'comment',
];

function toDbRow(entity) {
  return [
    entity.userId,
    entity.providerId,
    entity.bookingId || null,
    entity.rating,
    entity.comment || '',
  ];
}

// ── DB-backed repository ─────────────────────────────────────────────────────

// Valid snake_case columns that may appear in UPDATE SET clauses (Weakness 6 fix)
const REVIEW_ALLOWED_COLS = new Set([
  'user_id', 'provider_id', 'booking_id', 'rating', 'comment',
]);

class ReviewDatabaseRepository extends DatabaseRepository {
  constructor() {
    super('reviews', mapRow, INSERT_COLS, toDbRow, REVIEW_ALLOWED_COLS);
  }

  async getByProviderId(providerId) {
    const res = await query(
      'SELECT * FROM reviews WHERE provider_id = $1 ORDER BY created_at DESC',
      [Number(providerId)]
    );
    return res.rows.map(mapRow);
  }

  /** SQL AVG for efficiency. */
  async getAverageRating(providerId) {
    const res = await query(
      'SELECT COALESCE(ROUND(AVG(rating)::NUMERIC, 1), 0) AS avg FROM reviews WHERE provider_id = $1',
      [Number(providerId)]
    );
    return parseFloat(res.rows[0].avg).toFixed(1);
  }
}

// ── CSV-backed repository ────────────────────────────────────────────────────

class ReviewFileRepository extends FileRepository {
  constructor() {
    super(
      path.join(__dirname, '../data/csv/reviews.csv'),
      Review.fromCSV,
      Review.csvHeader
    );
  }

  getByProviderId(providerId) {
    return this.getAll().filter(r => r.providerId === Number(providerId));
  }

  getAverageRating(providerId) {
    const reviews = this.getByProviderId(providerId);
    if (!reviews.length) return '0.0';
    const total = reviews.reduce((s, r) => s + r.rating, 0);
    return (total / reviews.length).toFixed(1);
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────

function createReviewRepository() {
  return process.env.USE_DB === 'true'
    ? new ReviewDatabaseRepository()
    : new ReviewFileRepository();
}

module.exports = { createReviewRepository, ReviewDatabaseRepository, ReviewFileRepository };
