/**
 * BookingService — Business logic for bookings.
 * All methods async.
 * Status values (matching DB CHECK): 'pending' | 'confirmed' | 'completed' | 'cancelled'
 */
class BookingService {
  constructor(repository) {
    this.repository = repository;
  }

  async getAllBookings() {
    return this.repository.getAll();
  }

  async getBookingById(id) {
    return this.repository.getById(Number(id));
  }

  async getBookingsByUser(userId) {
    if (typeof this.repository.getByUserId === 'function') {
      return this.repository.getByUserId(userId);
    }
    const all = await this.repository.getAll();
    return all.filter(b => b.userId === Number(userId));
  }

  async getBookingsByProvider(providerId) {
    if (typeof this.repository.getByProviderId === 'function') {
      return this.repository.getByProviderId(providerId);
    }
    const all = await this.repository.getAll();
    return all.filter(b => b.providerId === Number(providerId));
  }

  async createBooking({ userId, serviceId, providerId, scheduledDate, totalPrice }) {
    if (!userId || !serviceId || !providerId || !scheduledDate) {
      throw new Error('userId, serviceId, providerId, and scheduledDate are required.');
    }

    return this.repository.add({
      userId:        Number(userId),
      serviceId:     Number(serviceId),
      providerId:    Number(providerId),
      scheduledDate,
      status:        'pending',
      totalPrice:    totalPrice ? Number(totalPrice) : null,
    });
  }

  async updateStatus(id, status) {
    const VALID = ['pending', 'confirmed', 'completed', 'cancelled'];
    const normalized = String(status || '').toLowerCase();
    if (!VALID.includes(normalized)) {
      throw new Error(`Invalid status. Must be one of: ${VALID.join(', ')}.`);
    }

    const booking = await this.repository.getById(Number(id));
    if (!booking) throw new Error('Booking not found.');

    return this.repository.update(Number(id), { status: normalized });
  }

  async deleteBooking(id) {
    const deleted = await this.repository.delete(Number(id));
    if (!deleted) throw new Error('Booking not found.');
    return { message: 'Booking deleted successfully.' };
  }
}

module.exports = BookingService;
