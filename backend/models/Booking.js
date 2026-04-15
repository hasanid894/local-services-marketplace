/**
 * Booking Model — aligned with the actual `bookings` PostgreSQL table.
 *
 * DB columns: id, user_id, service_id, provider_id, scheduled_date,
 *             status, total_price, created_at
 *
 * Status values (lowercase, matching DB CHECK constraint):
 *   'pending' | 'confirmed' | 'completed' | 'cancelled'
 */
class Booking {
  constructor(
    id,
    userId,
    serviceId,
    providerId,
    scheduledDate,
    status     = 'pending',
    totalPrice = null,
    createdAt  = new Date().toISOString()
  ) {
    this.id            = id;
    this.userId        = userId;
    this.serviceId     = serviceId;
    this.providerId    = providerId;
    this.scheduledDate = scheduledDate;
    this.status        = status;
    this.totalPrice    = totalPrice;
    this.createdAt     = createdAt;
  }

  toCSV() {
    return `${this.id},${this.userId},${this.serviceId},${this.providerId},${this.scheduledDate},${this.status},${this.totalPrice},${this.createdAt}`;
  }

  static fromCSV(line) {
    const [id, userId, serviceId, providerId, scheduledDate, status, totalPrice, createdAt] = line.split(',');
    return new Booking(
      Number(id), Number(userId), Number(serviceId), Number(providerId),
      scheduledDate, status,
      totalPrice ? Number(totalPrice) : null,
      createdAt
    );
  }

  static csvHeader() {
    return 'id,userId,serviceId,providerId,scheduledDate,status,totalPrice,createdAt';
  }
}

module.exports = Booking;
