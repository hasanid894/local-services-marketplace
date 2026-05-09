/**
 * BookingService — Business logic for bookings.
 * All methods async.
 * Status values (matching DB CHECK): 'pending' | 'confirmed' | 'completed' | 'cancelled'
 */
const VALID_PREFERRED_TIMES = new Set(['morning', 'afternoon', 'evening', 'flexible']);
const NOTE_MAX = 4000;

function clipNote(s, max = NOTE_MAX) {
  const t = String(s ?? '').trim();
  if (!t.length) return '';
  return t.length <= max ? t : t.slice(0, max);
}

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

  async createBooking(body) {
    const {
      userId,
      serviceId,
      providerId,
      scheduledDate,
      totalPrice,
      jobAddress,
      jobCity,
      preferredTime,
      customerNotes,
      accessNotes,
      notes,
    } = body || {};

    if (!userId || !serviceId || !providerId || !scheduledDate) {
      throw new Error('userId, serviceId, providerId, and scheduledDate are required.');
    }

    const addr = String(jobAddress ?? '').trim();
    const city = String(jobCity ?? '').trim();
    if (addr.length < 5) {
      throw new Error('Please enter the full street address where the provider should arrive (at least 5 characters).');
    }
    if (city.length < 2) {
      throw new Error('Please enter the city or area.');
    }

    const slot = String(preferredTime || 'flexible').toLowerCase();
    if (!VALID_PREFERRED_TIMES.has(slot)) {
      throw new Error('Preferred time must be morning, afternoon, evening, or flexible.');
    }

    const mergedCustomerNotes = clipNote(customerNotes ?? notes ?? '');

    return this.repository.add({
      userId:        Number(userId),
      serviceId:     Number(serviceId),
      providerId:    Number(providerId),
      scheduledDate,
      status:        'pending',
      totalPrice:    totalPrice ? Number(totalPrice) : null,
      jobAddress:    addr,
      jobCity:       city,
      preferredTime: slot,
      customerNotes: mergedCustomerNotes,
      accessNotes:   clipNote(accessNotes),
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
