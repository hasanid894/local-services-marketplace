/**
 * DatabaseRepository — Real PostgreSQL implementation of IRepository.
 *
 * Uses parameterised queries via the `pg` Pool helper in config/db.js.
 * Column name mapping:
 *   - JS camelCase fields ↔ SQL snake_case columns
 *
 * All methods are async and return Promises.
 * Controllers must use `await` when calling service/repository methods.
 */

const { query } = require('../config/db');
const IRepository = require('./IRepository');

/**
 * Convert a snake_case DB row object into whatever the model expects.
 * Each concrete repository can override `_mapRow(row)` if the mapping differs.
 */
class DatabaseRepository extends IRepository {
  /**
   * @param {string} tableName - Exact PostgreSQL table name (e.g. 'services').
   * @param {Function} mapRow - Optional function(row) → plain object. Defaults to identity.
   * @param {string[]} insertColumns - Ordered list of JS field names used for INSERT.
   * @param {Function} toDbRow - Function(entity) → array of values matching insertColumns.
   */
  constructor(tableName, mapRow, insertColumns = [], toDbRow = null) {
    super();
    this.tableName     = tableName;
    this._mapRow       = mapRow       || (row => row);
    this._insertCols   = insertColumns;
    this._toDbRow      = toDbRow      || (() => { throw new Error('toDbRow not implemented'); });

    console.log(`[DatabaseRepository] Using table "${this.tableName}" (PostgreSQL).`);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  /** Build a $1, $2, ... placeholder string for N params. */
  _placeholders(n, offset = 0) {
    return Array.from({ length: n }, (_, i) => `$${i + 1 + offset}`).join(', ');
  }

  // ── IRepository implementation ──────────────────────────────────────────

  /** SELECT * FROM table */
  async getAll() {
    const res = await query(`SELECT * FROM ${this.tableName} ORDER BY id`);
    return res.rows.map(r => this._mapRow(r));
  }

  /** SELECT * FROM table WHERE id = $1 */
  async getById(id) {
    const res = await query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return res.rows.length ? this._mapRow(res.rows[0]) : null;
  }

  /**
   * INSERT INTO table (col1, col2, ...) VALUES ($1, $2, ...) RETURNING *
   * The entity must NOT include `id` or `created_at` — those are DB-generated.
   */
  async add(entity) {
    const values  = this._toDbRow(entity);
    const colList = this._insertCols.join(', ');
    const phList  = this._placeholders(values.length);

    const res = await query(
      `INSERT INTO ${this.tableName} (${colList}) VALUES (${phList}) RETURNING *`,
      values
    );
    return this._mapRow(res.rows[0]);
  }

  /** No-op — PostgreSQL commits each statement atomically. */
  async save() { /* intentional no-op */ }

  /** DELETE FROM table WHERE id = $1 */
  async delete(id) {
    const res = await query(
      `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`,
      [id]
    );
    return res.rowCount > 0;
  }

  /**
   * UPDATE table SET col=$1, ... WHERE id=$N RETURNING *
   * Only updates fields that are present in updatedData.
   */
  async update(id, updatedData) {
    // Build SET clause dynamically: col1=$1, col2=$2, ...
    const entries = Object.entries(updatedData);
    if (entries.length === 0) return this.getById(id);

    const setClauses = entries.map(([col], i) => `${col} = $${i + 1}`).join(', ');
    const values     = entries.map(([, v]) => v);
    values.push(id);

    const res = await query(
      `UPDATE ${this.tableName} SET ${setClauses} WHERE id = $${values.length} RETURNING *`,
      values
    );
    return res.rows.length ? this._mapRow(res.rows[0]) : null;
  }
}

module.exports = DatabaseRepository;
