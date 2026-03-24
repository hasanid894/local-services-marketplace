class BookingService {
  constructor(repository) {
    this.repository = repository;
  }

  getAllBookings() {
    return this.repository.getAll();
  }

  getBookingById(id) {
    return this.repository.getById(id);
  }

  getBookingsByUser(userId) {
    return this.repository.getAll().filter(b => b.userId === Number(userId));
  }

  getBookingsByProvider(providerId) {
    return this.repository.getAll().filter(b => b.providerId === Number(providerId));
  }

  createBooking({ userId, serviceId, providerId, scheduledDate, notes = '' }) {
    const booking = {
      id: null,
      userId,
      serviceId,
      providerId,
      scheduledDate,
      status: 'Pending',
      notes,
      createdAt: new Date().toISOString()
    };

    return this.repository.add(booking);
  }

  updateStatus(id, status) {
    const booking = this.repository.getById(id);
    if (!booking) throw new Error('Booking not found.');

    const validStatuses = ['Pending', 'Approved', 'Rejected', 'Completed'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status.');
    }

    return this.repository.update(id, { status });
  }

  deleteBooking(id) {
    const deleted = this.repository.delete(id);
    if (!deleted) throw new Error('Booking not found.');

    return { message: 'Booking deleted successfully.' };
  }
}

module.exports = BookingService;
