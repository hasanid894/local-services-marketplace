const path = require('path');
const FileRepository = require('../repositories/FileRepository');
const BookingService = require('../services/BookingService');
const Booking = require('../models/Booking');

const repo = new FileRepository(
  path.join(__dirname, '../data/csv/bookings.csv'),
  Booking.fromCSV,
  Booking.csvHeader
);

const bookingService = new BookingService(repo);

exports.getBookings = (req, res) => {
  try {
    const { userId, providerId } = req.query;
    let data = bookingService.getAllBookings();

    if (userId) data = bookingService.getBookingsByUser(userId);
    if (providerId) data = data.filter(b => b.providerId === Number(providerId));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBookingById = (req, res) => {
  try {
    const booking = bookingService.getBookingById(Number(req.params.id));
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createBooking = (req, res) => {
  try {
    const created = bookingService.createBooking(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateBookingStatus = (req, res) => {
  try {
    const updated = bookingService.updateStatus(Number(req.params.id), req.body.status);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteBooking = (req, res) => {
  try {
    const result = bookingService.deleteBooking(Number(req.params.id));
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
