const path               = require('path');
const FileRepository     = require('./FileRepository');
const DatabaseRepository = require('./DatabaseRepository');
const Booking            = require('../models/Booking');
const { query }          = require('../config/db');

// ── Column mapping ───────────────────────────────────────────────────────────

/**
 * DB columns: id, user_id, service_id, provider_id, scheduled_date,
 *             status, total_price, created_at
 * Status values: 'pending' | 'confirmed' | 'completed' | 'cancelled'
 */
function mapRow(row) {
  return {
    id:            row.id,
    userId:        row.user_id,
    serviceId:     row.service_id,
    providerId:    row.provider_id,
    scheduledDate: row.scheduled_date,
    status:        row.status,       // lowercase
    totalPrice:    row.total_price ? parseFloat(row.total_price) : null,
    createdAt:     row.created_at,
  };
}

const INSERT_COLS = [
  'user_id', 'service_id', 'provider_id', 'scheduled_date', 'status', 'total_price',
];

function toDbRow(entity) {
  return [
    entity.userId,
    entity.serviceId,
    entity.providerId,
    entity.scheduledDate,
    (entity.status || 'pending').toLowerCase(),
    entity.totalPrice ?? null,
  ];
}

// ── DB-backed repository ─────────────────────────────────────────────────────

class BookingDatabaseRepository extends DatabaseRepository {
  constructor() {
    super('bookings', mapRow, INSERT_COLS, toDbRow);
  }

  async getByUserId(userId) {
    const res = await query(
      'SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC',
      [Number(userId)]
    );
    return res.rows.map(mapRow);
  }

  async getByProviderId(providerId) {
    const res = await query(
      'SELECT * FROM bookings WHERE provider_id = $1 ORDER BY created_at DESC',
      [Number(providerId)]
    );
    return res.rows.map(mapRow);
  }

  async update(id, updatedData) {
    const colMap = {
      userId:        'user_id',
      serviceId:     'service_id',
      providerId:    'provider_id',
      scheduledDate: 'scheduled_date',
      status:        'status',
      totalPrice:    'total_price',
    };
    const sqlData = {};
    for (const [key, val] of Object.entries(updatedData)) {
      const col = colMap[key] || key;
      sqlData[col] = (key === 'status' && val) ? String(val).toLowerCase() : val;
    }
    return super.update(id, sqlData);
  }
}

// ── CSV-backed repository ────────────────────────────────────────────────────

class BookingFileRepository extends FileRepository {
  constructor() {
    super(
      path.join(__dirname, '../data/csv/bookings.csv'),
      Booking.fromCSV,
      Booking.csvHeader
    );
  }

  getByUserId(userId) {
    return this.getAll().filter(b => b.userId === Number(userId));
  }

  getByProviderId(providerId) {
    return this.getAll().filter(b => b.providerId === Number(providerId));
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────

function createBookingRepository() {
  return process.env.USE_DB === 'true'
    ? new BookingDatabaseRepository()
    : new BookingFileRepository();
}

module.exports = { createBookingRepository, BookingDatabaseRepository, BookingFileRepository };
