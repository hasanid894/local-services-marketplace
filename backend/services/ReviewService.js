class ReviewService {
  constructor(repository) {
    this.repository = repository;
  }

  getAllReviews() {
    return this.repository.getAll();
  }

  getReviewById(id) {
    return this.repository.getById(id);
  }

  getReviewsByProvider(providerId) {
    return this.repository.getAll().filter(r => r.providerId === Number(providerId));
  }

  getAverageRating(providerId) {
    const reviews = this.getReviewsByProvider(providerId);
    if (reviews.length === 0) return 0;

    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / reviews.length).toFixed(1);
  }

  createReview({ userId, providerId, bookingId, rating, comment = '' }) {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5.');
    }

    const review = {
      id: null,
      userId,
      providerId,
      bookingId,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    return this.repository.add(review);
  }

  deleteReview(id) {
    const deleted = this.repository.delete(id);
    if (!deleted) throw new Error('Review not found.');

    return { message: 'Review deleted successfully.' };
  }
}

module.exports = ReviewService;
