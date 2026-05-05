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
    const parts = line.split(',');

    // Current format:
    // id,providerId,categoryId,title,description,price,location,latitude,longitude,isActive,createdAt
    if (parts.length >= 11) {
      const [id, providerId, categoryId, title, description, price, location, latitude, longitude, isActive, createdAt] = parts;
      return new Service(
        Number(id),
        Number(providerId),
        Number(categoryId),
        title,
        description,
        Number(price),
        location || '',
        latitude ? Number(latitude) : null,
        longitude ? Number(longitude) : null,
        String(isActive).toLowerCase() === 'true',
        createdAt
      );
    }

    // Legacy format (kept for backward compatibility):
    // id,providerId,title,description,category,location,price,status,createdAt
    const [id, providerId, title, description, category, location, price, status, createdAt] = parts;
    const service = new Service(
      Number(id),
      Number(providerId),
      null,
      title || '',
      description || '',
      Number(price),
      location || '',
      null,
      null,
      String(status || '').toLowerCase() !== 'inactive',
      createdAt
    );
    service.category = category || '';
    return service;
  }

  static csvHeader() {
    return 'id,providerId,categoryId,title,description,price,location,latitude,longitude,isActive,createdAt';
  }
}

module.exports = Service;
