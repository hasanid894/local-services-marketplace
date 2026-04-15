/**
 * UserService — Business logic for users.
 * All methods async; compatible with DB and CSV repositories.
 */
class UserService {
  constructor(repository) {
    this.repository = repository;
  }

  async getAllUsers() {
    return this.repository.getAll();
  }

  async getUserById(id) {
    return this.repository.getById(Number(id));
  }

  async getUserByEmail(email) {
    if (typeof this.repository.findByEmail === 'function') {
      return this.repository.findByEmail(email);
    }
    const all = await this.repository.getAll();
    return all.find(u => u.email === email.trim().toLowerCase()) || null;
  }

  async createUser({ name, email, passwordHash, role = 'customer', location = '', latitude = null, longitude = null }) {
    const existing = await this.getUserByEmail(email);
    if (existing) throw new Error('Email already registered.');

    return this.repository.add({
      name,
      email: email.trim().toLowerCase(),
      passwordHash,
      role:      String(role).toLowerCase(),
      location:  location  || '',
      latitude:  latitude  ?? null,
      longitude: longitude ?? null,
      isVerified: false,
    });
  }

  async updateUser(id, data) {
    const user = await this.repository.getById(Number(id));
    if (!user) throw new Error('User not found.');
    return this.repository.update(Number(id), data);
  }

  async deleteUser(id) {
    const deleted = await this.repository.delete(Number(id));
    if (!deleted) throw new Error('User not found.');
    return { message: 'User deleted successfully.' };
  }
}

module.exports = UserService;
