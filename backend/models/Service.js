/**
 * Service Model — aligned with the actual `services` PostgreSQL table.
 *
 * DB columns: id, provider_id, category_id, title, description, price,
 *             location, latitude, longitude, is_active, created_at
 *
 * Note: services use category_id (FK to categories table), not a string category.
 */
class Service {
  constructor(
    id,
    providerId,
    categoryId,
    title,
    description = '',
    price,
    location    = '',
    latitude    = null,
    longitude   = null,
    isActive    = true,
    createdAt   = new Date().toISOString()
  ) {
    this.id          = id;
    this.providerId  = providerId;
    this.categoryId  = categoryId;
    this.title       = title;
    this.description = description;
    this.price       = price;
    this.location    = location;
    this.latitude    = latitude;
    this.longitude   = longitude;
    this.isActive    = isActive;
    this.createdAt   = createdAt;
  }

  toCSV() {
    return `${this.id},${this.providerId},${this.categoryId},${this.title},${this.description},${this.price},${this.location},${this.latitude},${this.longitude},${this.isActive},${this.createdAt}`;
  }

  static fromCSV(line) {
    const [id, providerId, categoryId, title, description, price, location, latitude, longitude, isActive, createdAt] = line.split(',');
    return new Service(
      Number(id), Number(providerId), Number(categoryId),
      title, description, Number(price),
      location || '',
      latitude  ? Number(latitude)  : null,
      longitude ? Number(longitude) : null,
      isActive === 'true',
      createdAt
    );
  }

  static csvHeader() {
    return 'id,providerId,categoryId,title,description,price,location,latitude,longitude,isActive,createdAt';
  }
}

module.exports = Service;
