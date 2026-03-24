/**
 * UserService - Logjika e biznesit për Users.
 *
 * SOLID: Single Responsibility Principle (SRP)
 * - Merret VETËM me logjikën e biznesit për Users.
 * - Persistence delegohet tek UserRepository (FileRepository).
 *
 * SOLID: Dependency Inversion Principle (DIP)
 * - Varet nga IRepository (abstrakti), jo nga implementimi konkret.
 */
class UserService {
  constructor(repository) {
    this.repository = repository;
  }
 
  getAllUsers() {
    return this.repository.getAll();
  }
 
  getUserById(id) {
    return this.repository.getById(id);
  }
 
  getUserByEmail(email) {
    return this.repository.getAll().find(u => u.email === email) || null;
  }
 
  createUser({ name, email, passwordHash, role = 'Customer', location = '' }) {
    const existing = this.getUserByEmail(email);
    if (existing) throw new Error('Email already registered.');

   const user = new (require('../models/User'))(
      null,
      name,
      email,
      passwordHash,
      role,
      location
    );

    return this.repository.add(user);
    
  }
 
  updateUser(id, data) {
    const user = this.repository.getById(id);
    if (!user) throw new Error('User not found.');
   
    return this.repository.update(id, data);
  }
 
  deleteUser(id) {
    const deleted = this.repository.delete(id);
    if (!deleted) throw new Error('User not found.');
    return { message: 'User deleted successfully.' };
  }
}
 
module.exports = UserService;
 
