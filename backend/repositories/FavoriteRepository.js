const { query } = require('../config/db');

class FavoriteDatabaseRepository {
  /** @returns {{ providerId:number, name:string }[]} */
  async listForUser(userId) {
    const res = await query(
      `
      SELECT u.id AS provider_id, u.name
      FROM favorite_providers f
      JOIN users u ON u.id = f.provider_id
      WHERE f.user_id = $1 AND LOWER(u.role) = 'provider'
      ORDER BY u.name ASC
      `,
      [Number(userId)]
    );
    return res.rows.map((r) => ({ providerId: r.provider_id, name: r.name }));
  }

  /** @returns {Promise<Set<number>>} */
  async providerIdsForUser(userId) {
    const res = await query(
      'SELECT provider_id FROM favorite_providers WHERE user_id = $1',
      [Number(userId)]
    );
    return new Set(res.rows.map((r) => Number(r.provider_id)));
  }

  async add(userId, providerId) {
    await query(
      `
      INSERT INTO favorite_providers (user_id, provider_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, provider_id) DO NOTHING
      `,
      [Number(userId), Number(providerId)]
    );
  }

  async remove(userId, providerId) {
    await query(
      'DELETE FROM favorite_providers WHERE user_id = $1 AND provider_id = $2',
      [Number(userId), Number(providerId)]
    );
  }
}

function createFavoriteRepository() {
  if (process.env.USE_DB !== 'true') return null;
  return new FavoriteDatabaseRepository();
}

module.exports = { FavoriteDatabaseRepository, createFavoriteRepository };
