/**
 * User Model — aligned with the actual `users` PostgreSQL table.
 *
 * DB columns: id, name, email, password_hash, role, location,
 *             latitude, longitude, is_verified, created_at
 *
 * Roles are lowercase in the DB: 'customer' | 'provider' | 'admin'
 */
class User {
  constructor(
    id,
    name,
    email,
    passwordHash,
    role       = 'customer',
    location   = '',
    latitude   = null,
    longitude  = null,
    isVerified = false,
    createdAt  = new Date().toISOString()
  ) {
    this.id          = id;
    this.name        = name;
    this.email       = email;
    this.passwordHash = passwordHash;
    this.role        = role;
    this.location    = location;
    this.latitude    = latitude;
    this.longitude   = longitude;
    this.isVerified  = isVerified;
    this.createdAt   = createdAt;
  }

  // CSV helpers kept for FileRepository fallback
  toCSV() {
    return `${this.id},${this.name},${this.email},${this.passwordHash},${this.role},${this.location},${this.latitude},${this.longitude},${this.isVerified},${this.createdAt}`;
  }

  static fromCSV(line) {
    const [id, name, email, passwordHash, role, location, latitude, longitude, isVerified, createdAt] = line.split(',');
    return new User(
      Number(id), name, email, passwordHash, role,
      location || '',
      latitude  ? Number(latitude)  : null,
      longitude ? Number(longitude) : null,
      isVerified === 'true',
      createdAt
    );
  }

  static csvHeader() {
    return 'id,name,email,passwordHash,role,location,latitude,longitude,isVerified,createdAt';
  }
}

module.exports = User;
