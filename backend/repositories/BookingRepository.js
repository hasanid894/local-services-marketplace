const path = require('path');
const FileRepository = require('./FileRepository');
const Booking = require('../models/Booking');

/**
 * BookingRepository — concrete FileRepository configured for bookings.csv.
 */
class BookingRepository extends FileRepository {
  constructor() {
    super(
      path.join(__dirname, '../data/csv/bookings.csv'),
      Booking.fromCSV,
      Booking.csvHeader
    );
  }
}

module.exports = BookingRepository;
