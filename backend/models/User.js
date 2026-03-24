/**
 * User Model
 * Represents a system actor: Customer, Provider, or Admin
 */
class User {
  constructor(
    id,
    name,
    email,
    passwordHash,
    role = 'Customer',
    location = '',
    providerProfile = null, // only for providers
    createdAt = new Date().toISOString()
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.location = location;
    this.providerProfile = providerProfile;
    this.createdAt = createdAt;
  }

  toCSV() {
    return `${this.id},${this.name},${this.email},${this.passwordHash},${this.role},${this.location},${JSON.stringify(this.providerProfile)},${this.createdAt}`;
  }

  static fromCSV(line) {
    const [id, name, email, passwordHash, role, location, providerProfile, createdAt] = line.split(',');
    return new User(
      Number(id),
      name,
      email,
      passwordHash,
      role,
      location,
      providerProfile ? JSON.parse(providerProfile) : null,
      createdAt
    );
  }

  static csvHeader() {
    return 'id,name,email,passwordHash,role,location,providerProfile,createdAt';
  }
}

module.exports = User;
