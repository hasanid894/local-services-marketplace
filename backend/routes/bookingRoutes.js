const express = require('express');
const router = express.Router();
const controller = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware');

// All booking operations require authentication
router.use(verifyToken);

router.get('/', controller.getBookings);
router.get('/:id', controller.getBookingById);
router.post('/', controller.createBooking);
router.patch('/:id/status', controller.updateBookingStatus);
router.delete('/:id', controller.deleteBooking);

module.exports = router;
