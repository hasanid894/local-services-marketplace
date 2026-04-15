/**
 * ReviewService — Business logic for reviews.
 * All methods async.
 */
class ReviewService {
  constructor(repository) {
    this.repository = repository;
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

    return this.repository.add({
      userId:     Number(userId),
      providerId: Number(providerId),
      bookingId:  bookingId ? Number(bookingId) : null,
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
