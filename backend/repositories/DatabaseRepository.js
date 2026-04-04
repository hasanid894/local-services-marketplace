/**
 * DatabaseRepository - Skeleton implementation of IRepository.
 *
 * This is a placeholder for a future PostgreSQL-backed repository.
 * It currently uses an in-memory store so the rest of the application
 * can be tested against this implementation without a real DB connection.
 *
 * Architecture principle: Dependency Inversion (SOLID - DIP).
 * ServiceService and all controllers depend on IRepository, NOT on this
 * concrete class. Swapping FileRepository ↔ DatabaseRepository requires
 * only a one-line change in the factory/config (serviceController.js).
 *
 * To connect a real PostgreSQL database in the future:
 *   1. Run: npm install pg
 *   2. Replace the in-memory _data array with actual SQL queries.
 *   3. Make the methods async and update callers accordingly.
 */

const IRepository = require('./IRepository');

class DatabaseRepository extends IRepository {
  /**
   * @param {string} tableName - The name of the database table (e.g. 'services').
   *   Currently unused — reserved for when a real DB connection is added.
   */
  constructor(tableName = 'services') {
    super();
    this.tableName = tableName;

    // In-memory store used as a placeholder until a real DB is connected.
    // Replace with actual DB queries (e.g. pg Pool) in the future.
    this._data = [];
    this._nextIdCounter = 1;

    console.log(
      `[DatabaseRepository] Initialized for table "${this.tableName}" ` +
      `(in-memory mode — connect a real DB to replace this).`
    );
  }

  // -----------------------------------------------------------------------
  // IRepository contract implementation
  // -----------------------------------------------------------------------

  /**
   * Return all stored entities.
   * Future: SELECT * FROM ${this.tableName}
   */
  getAll() {
    return [...this._data];
  }

  /**
   * Return a single entity by ID, or null if not found.
   * Future: SELECT * FROM ${this.tableName} WHERE id = $1
   */
  getById(id) {
    return this._data.find(e => e.id === Number(id)) || null;
  }

  /**
   * Persist a new entity, auto-assigning an ID.
   * Future: INSERT INTO ${this.tableName} (...) VALUES (...) RETURNING *
   */
  add(entity) {
    entity.id = this._nextIdCounter++;
    this._data.push({ ...entity });
    return entity;
  }

  /**
   * Persist all current data (no-op for in-memory; would be a commit in a
   * real transactional DB).
   * Future: handled implicitly by the DB — leave as no-op.
   */
  save() {
    // No-op for in-memory mode.
    // In a real DB implementation this method is not needed because
    // each query is its own atomic operation.
  }

  /**
   * Delete an entity by ID. Returns false if not found.
   * Future: DELETE FROM ${this.tableName} WHERE id = $1
   */
  delete(id) {
    const index = this._data.findIndex(e => e.id === Number(id));
    if (index === -1) return false;

    this._data.splice(index, 1);
    return true;
  }

  /**
   * Update an existing entity's fields. Returns the updated entity or null.
   * Future: UPDATE ${this.tableName} SET ... WHERE id = $1 RETURNING *
   */
  update(id, updatedData) {
    const index = this._data.findIndex(e => e.id === Number(id));
    if (index === -1) return null;

    Object.assign(this._data[index], updatedData);
    return { ...this._data[index] };
  }
}

module.exports = DatabaseRepository;
