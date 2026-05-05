/**
 * ReviewService — Business logic for reviews.
 * All methods async.
 *
 * bookingService is injected so we can verify a booking exists
 * and has status 'completed' before allowing a review.
 */
class ReviewService {
  /**
   * @param {object} repository     - ReviewRepository instance
   * @param {object} bookingService - BookingService instance (optional; skips check if absent)
   */
  constructor(repository, bookingService = null) {
    this.repository     = repository;
    this.bookingService = bookingService;
  }

  async getAllReviews() {
    return this.repository.getAll();
  }

  async getReviewById(id) {
    return this.repository.getById(Number(id));
  }

  async getReviewsByProvider(providerId) {
    if (typeof this.repository.getByProviderId === 'function') {
      return this.repository.getByProviderId(providerId);
    }
    const all = await this.repository.getAll();
    return all.filter(r => r.providerId === Number(providerId));
  }

  async getAverageRating(providerId) {
    if (typeof this.repository.getAverageRating === 'function') {
      return this.repository.getAverageRating(providerId);
    }
    const reviews = await this.getReviewsByProvider(providerId);
    if (!reviews.length) return '0.0';
    const total = reviews.reduce((s, r) => s + r.rating, 0);
    return (total / reviews.length).toFixed(1);
  }

  async createReview({ userId, providerId, bookingId, rating, comment = '' }) {
    const r = Number(rating);
    if (isNaN(r) || r < 1 || r > 5) throw new Error('Rating must be between 1 and 5.');
    if (!userId || !providerId)       throw new Error('userId and providerId are required.');
    if (!bookingId)                   throw new Error('A booking must be selected to post a review.');

    // Guard: booking must exist and be completed
    if (this.bookingService) {
      const booking = await this.bookingService.getBookingById(Number(bookingId));
      if (!booking) {
        throw new Error('Booking not found.');
      }
      if (String(booking.status).toLowerCase() !== 'completed') {
        throw new Error('You can only review a completed booking.');
      }
    }

    return this.repository.add({
      userId:     Number(userId),
      providerId: Number(providerId),
      bookingId:  Number(bookingId),
      rating:     r,
      comment,
    });
  }

  async deleteReview(id) {
    const deleted = await this.repository.delete(Number(id));
    if (!deleted) throw new Error('Review not found.');
    return { message: 'Review deleted successfully.' };
  }
}

module.exports = ReviewService;
