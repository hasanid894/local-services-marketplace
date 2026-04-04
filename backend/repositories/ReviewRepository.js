const path = require('path');
const FileRepository = require('./FileRepository');
const Review = require('../models/Review');

/**
 * ReviewRepository — concrete FileRepository configured for reviews.csv.
 */
class ReviewRepository extends FileRepository {
  constructor() {
    super(
      path.join(__dirname, '../data/csv/reviews.csv'),
      Review.fromCSV,
      Review.csvHeader
    );
  }
}

module.exports = ReviewRepository;
