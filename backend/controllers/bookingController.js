/**
 * bookingController.js
 *
 * Handles all /api/bookings routes.
 *
 * Improvement (Weakness 2 — Dependency Injection):
 *   bookingService is now imported from container.js instead of being
 *   instantiated here. The controller has zero wiring code.
 *
 * Improvement (Weakness 7 — NotificationService connected):
 *   notificationService is called after create and status-update operations.
 */

const { bookingService, notificationService } = require('../container');

/**
 * GET /api/bookings
 * Query params: userId, providerId
 */
exports.getBookings = async (req, res) => {
  try {
    const { userId, providerId } = req.query;
    let data;

    if (userId)          data = await bookingService.getBookingsByUser(userId);
    else if (providerId) data = await bookingService.getBookingsByProvider(providerId);
    else                 data = await bookingService.getAllBookings();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/bookings/:id
 */
exports.getBookingById = async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(Number(req.params.id));
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/bookings
 * Body: { userId, serviceId, providerId, scheduledDate, totalPrice }
 */
exports.createBooking = async (req, res) => {
  try {
    const created = await bookingService.createBooking(req.body);
    // Notify after successful booking creation (Weakness 7 fix)
    notificationService.notifyBookingCreated(created);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * PATCH /api/bookings/:id/status
 * Body: { status } — one of 'pending'|'confirmed'|'completed'|'cancelled'
 */
exports.updateBookingStatus = async (req, res) => {
  try {
    const updated = await bookingService.updateStatus(Number(req.params.id), req.body.status);
    // Notify after status change (Weakness 7 fix)
    notificationService.notifyBookingStatusChanged(updated);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * DELETE /api/bookings/:id
 */
exports.deleteBooking = async (req, res) => {
  try {
    const result = await bookingService.deleteBooking(Number(req.params.id));
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
