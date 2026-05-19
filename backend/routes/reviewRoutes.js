const express = require('express');
const router = express.Router();
const controller = require('../controllers/reviewController');
const { attachDemoUser, verifyToken, requireRole } = require('../middleware/authMiddleware');

// Public reads
router.get('/', attachDemoUser, controller.getReviews);
router.get('/:id', attachDemoUser, controller.getReviewById);

// Write operations require auth
router.post('/', verifyToken, requireRole('customer'), controller.createReview);
router.delete('/:id', verifyToken, controller.deleteReview);

module.exports = router;
