class FavoriteService {
  /** @param {import('../repositories/FavoriteRepository').FavoriteDatabaseRepository|null} favorites */
  constructor(favorites, userRepository) {
    this.favorites = favorites;
    this.users     = userRepository;
  }

  requireDb() {
    if (!this.favorites) throw new Error('Favorites require PostgreSQL (RUN with USE_DB=true and apply migrations).');
  }

  async list(userId) {
    this.requireDb();
    return this.favorites.listForUser(Number(userId));
  }

  async providerSet(userId) {
    if (!this.favorites) return new Set();
    return this.favorites.providerIdsForUser(Number(userId));
  }

  async add(userId, providerId) {
    this.requireDb();
    const uid = Number(userId);
    const pid = Number(providerId);
    if (uid <= 0 || pid <= 0) throw new Error('Invalid user or provider.');

    const provider = await this.users.getById(pid);
    if (!provider || String(provider.role || '').toLowerCase() !== 'provider') {
      throw new Error('You can favorite only verified service providers.');
    }
    if (uid === pid) throw new Error('You cannot add yourself as a favorite.');

    await this.favorites.add(uid, pid);
    return { message: 'Provider saved to favorites.' };
  }

  async remove(userId, providerId) {
    this.requireDb();
    await this.favorites.remove(Number(userId), Number(providerId));
    return { message: 'Favorite removed.' };
  }
}

module.exports = FavoriteService;
