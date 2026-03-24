/**
 * Review Model
 * Represents a rating and comment left by a User after a completed Booking.
 */
class Review {

  constructor(id, userId, providerId, bookingId, rating, comment = '', createdAt = new Date().toISOString()) {
    this.id = id;
    this.userId = userId;
    this.providerId = providerId;
    this.bookingId = bookingId;
    this.rating = rating;
    this.comment = comment;
    this.createdAt = createdAt;
  }
 
  toCSV() {
    return `${this.id},${this.userId},${this.providerId},${this.bookingId},${this.rating},${this.comment},${this.createdAt}`;
  }
 
  static fromCSV(line) {
    const [id, userId, providerId, bookingId, rating, comment, createdAt] = line.split(',');
    return new Review(Number(id), Number(userId), Number(providerId), Number(bookingId), Number(rating), comment, createdAt);
  }
 
  static csvHeader() {
    return 'id,userId,providerId,bookingId,rating,comment,createdAt';
  }
}
 
module.exports = Review;
