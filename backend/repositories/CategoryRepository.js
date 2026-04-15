const DatabaseRepository = require('./DatabaseRepository');
const { query }          = require('../config/db');

function mapRow(row) {
  return { id: row.id, name: row.name };
}

class CategoryRepository extends DatabaseRepository {
  constructor() {
    super('categories', mapRow, ['name'], entity => [entity.name]);
  }

  async findByName(name) {
    const res = await query('SELECT * FROM categories WHERE name ILIKE $1 LIMIT 1', [name]);
    return res.rows.length ? mapRow(res.rows[0]) : null;
  }

  /** Get or create a category by name. Returns the category object. */
  async findOrCreate(name) {
    const existing = await this.findByName(name);
    if (existing) return existing;
    return this.add({ name });
  }
}

module.exports = CategoryRepository;
