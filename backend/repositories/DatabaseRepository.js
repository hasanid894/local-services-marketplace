/**
 * DatabaseRepository — Real PostgreSQL implementation of IRepository.
 *
 * Uses parameterised queries via the `pg` Pool helper in config/db.js.
 * Column name mapping:
 *   - JS camelCase fields ↔ SQL snake_case columns
 *
 * All methods are async and return Promises.
 * Controllers must use `await` when calling service/repository methods.
 *
 * Improvement (Weakness 6 — Column Whitelist in update()):
 *   Each concrete subclass must set this._allowedCols (a Set of valid
 *   snake_case column names). The update() method filters out any key
 *   not in that Set before building the SQL query. This prevents
 *   unvalidated column names from reaching the SQL layer.
 */

const { query } = require('../config/db');
const IRepository = require('./IRepository');

class DatabaseRepository extends IRepository {
  /**
   * @param {string}   tableName     - Exact PostgreSQL table name (e.g. 'services').
   * @param {Function} mapRow        - Optional function(row) → plain object. Defaults to identity.
   * @param {string[]} insertColumns - Ordered list of SQL column names used for INSERT.
   * @param {Function} toDbRow       - Function(entity) → array of values matching insertColumns.
   * @param {Set}      allowedCols   - Set of snake_case column names allowed in UPDATE (Weakness 6 fix).
   */
  constructor(tableName, mapRow, insertColumns = [], toDbRow = null, allowedCols = new Set()) {
    super();
    this.tableName     = tableName;
    this._mapRow       = mapRow       || (row => row);
    this._insertCols   = insertColumns;
    this._toDbRow      = toDbRow      || (() => { throw new Error('toDbRow not implemented'); });
    // Whitelist of column names permitted in UPDATE SET clauses (Weakness 6 fix)
    this._allowedCols  = allowedCols;

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
   *
   * Weakness 6 fix — Column Whitelist:
   *   Only keys present in this._allowedCols are included in the SET clause.
   *   Any unknown key is silently dropped and a warning is logged.
   *   This prevents unvalidated column names from appearing in SQL,
   *   which would be a SQL injection risk since column names cannot
   *   be parameterised the same way values can.
   */
  async update(id, updatedData) {
    let entries = Object.entries(updatedData);

    // Filter against the whitelist if one is defined
    if (this._allowedCols.size > 0) {
      const rejected = entries.filter(([col]) => !this._allowedCols.has(col));
      if (rejected.length > 0) {
        console.warn(
          `[DatabaseRepository:${this.tableName}] update() rejected unknown columns: ` +
          rejected.map(([c]) => c).join(', ')
        );
      }
      entries = entries.filter(([col]) => this._allowedCols.has(col));
    }

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
