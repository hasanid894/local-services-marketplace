const path               = require('path');
const FileRepository     = require('./FileRepository');
const DatabaseRepository = require('./DatabaseRepository');
const Service            = require('../models/Service');
const { query }          = require('../config/db');

// ── Column mapping ───────────────────────────────────────────────────────────

/**
 * DB columns: id, provider_id, category_id, title, description, price,
 *             location, latitude, longitude, is_active, created_at
 */
function mapRow(row) {
  return {
    id:          row.id,
    providerId:  row.provider_id,
    categoryId:  row.category_id,
    title:       row.title,
    description: row.description || '',
    price:       parseFloat(row.price),
    location:    row.location   || '',
    latitude:    row.latitude   ? parseFloat(row.latitude)  : null,
    longitude:   row.longitude  ? parseFloat(row.longitude) : null,
    isActive:    row.is_active,
    imageUrl:    row.image_url  || null,
    createdAt:   row.created_at,
  };
}

const INSERT_COLS = [
  'provider_id', 'category_id', 'title', 'description',
  'price', 'location', 'latitude', 'longitude', 'is_active', 'image_url',
];

function toDbRow(entity) {
  return [
    entity.providerId,
    entity.categoryId,
    entity.title,
    entity.description || '',
    entity.price,
    entity.location   || '',
    entity.latitude   ?? null,
    entity.longitude  ?? null,
    entity.isActive   ?? true,
    entity.imageUrl   || null,
  ];
}

// ── DB-backed repository ─────────────────────────────────────────────────────

// Valid snake_case columns that may appear in UPDATE SET clauses (Weakness 6 fix)
const SERVICE_ALLOWED_COLS = new Set([
  'provider_id', 'category_id', 'title', 'description',
  'price', 'location', 'latitude', 'longitude', 'is_active', 'image_url',
]);

class ServiceDatabaseRepository extends DatabaseRepository {
  constructor() {
    super('services', mapRow, INSERT_COLS, toDbRow, SERVICE_ALLOWED_COLS);
  }

  /**
   * Filter by categoryId, location, and/or providerId using SQL WHERE.
   * Also support category name lookup via JOIN with categories table.
   */
  async getFiltered({ categoryId, location, providerId, activeOnly = true } = {}) {
    const conditions = [];
    const values     = [];

    if (activeOnly)   { conditions.push(`s.is_active = TRUE`); }
    if (categoryId)   { conditions.push(`s.category_id = $${values.length + 1}`);  values.push(Number(categoryId)); }
    if (location)     { conditions.push(`s.location ILIKE $${values.length + 1}`); values.push(`%${location}%`); }
    if (providerId)   { conditions.push(`s.provider_id = $${values.length + 1}`);  values.push(Number(providerId)); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql   = `
      SELECT s.*, c.name AS category_name
      FROM services s
      LEFT JOIN categories c ON c.id = s.category_id
      ${where}
      ORDER BY s.id
    `;
    const res = await query(sql, values);
    return res.rows.map(row => ({ ...mapRow(row), categoryName: row.category_name }));
  }

  async getAll() {
    const res = await query(`
      SELECT s.*, c.name AS category_name
      FROM services s
      LEFT JOIN categories c ON c.id = s.category_id
      ORDER BY s.id
    `);
    return res.rows.map(row => ({ ...mapRow(row), categoryName: row.category_name }));
  }

  async getById(id) {
    const res = await query(`
      SELECT s.*, c.name AS category_name
      FROM services s
      LEFT JOIN categories c ON c.id = s.category_id
      WHERE s.id = $1
    `, [id]);
    if (!res.rows.length) return null;
    const row = res.rows[0];
    return { ...mapRow(row), categoryName: row.category_name };
  }

  async update(id, updatedData) {
    const colMap = {
      providerId:  'provider_id',
      categoryId:  'category_id',
      title:       'title',
      description: 'description',
      price:       'price',
      location:    'location',
      latitude:    'latitude',
      longitude:   'longitude',
      isActive:    'is_active',
      imageUrl:    'image_url',
    };
    const sqlData = {};
    for (const [key, val] of Object.entries(updatedData)) {
      sqlData[colMap[key] || key] = val;
    }
    return super.update(id, sqlData);
  }
}

// ── CSV-backed repository ────────────────────────────────────────────────────

class ServiceFileRepository extends FileRepository {
  constructor() {
    super(
      path.join(__dirname, '../data/csv/services.csv'),
      Service.fromCSV,
      Service.csvHeader
    );
  }

  getFiltered({ categoryId, location, providerId, activeOnly = true } = {}) {
    let data = this.getAll();
    if (activeOnly)  data = data.filter(s => s.isActive);
    if (categoryId)  data = data.filter(s => s.categoryId === Number(categoryId));
    if (location)    data = data.filter(s => s.location && s.location.toLowerCase().includes(location.toLowerCase()));
    if (providerId)  data = data.filter(s => s.providerId === Number(providerId));
    return data;
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────

function createServiceRepository() {
  return process.env.USE_DB === 'true'
    ? new ServiceDatabaseRepository()
    : new ServiceFileRepository();
}

module.exports = { createServiceRepository, ServiceDatabaseRepository, ServiceFileRepository };
