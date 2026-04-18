/**
 * reviewController.js
 *
 * Handles all /api/reviews routes.
 *
 * Improvement (Weakness 2 — Dependency Injection):
 *   reviewService is now imported from container.js instead of being
 *   instantiated here. The controller has zero wiring code.
 */

const { reviewService } = require('../container');

/**
 * GET /api/reviews
 * Query params: providerId
 */
exports.getReviews = async (req, res) => {
  try {
    const { providerId } = req.query;
    const data = providerId
      ? await reviewService.getReviewsByProvider(providerId)
      : await reviewService.getAllReviews();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/reviews/:id
 */
exports.getReviewById = async (req, res) => {
  try {
    const review = await reviewService.getReviewById(Number(req.params.id));
    if (!review) return res.status(404).json({ error: 'Review not found.' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/reviews
 * Body: { userId, providerId, bookingId, rating, comment }
 */
exports.createReview = async (req, res) => {
  try {
    const created = await reviewService.createReview(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * DELETE /api/reviews/:id
 */
exports.deleteReview = async (req, res) => {
  try {
    const result = await reviewService.deleteReview(Number(req.params.id));
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
