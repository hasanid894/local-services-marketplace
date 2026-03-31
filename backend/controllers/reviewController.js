const path = require('path');
const FileRepository = require('../repositories/FileRepository');
const ReviewService = require('../services/ReviewService');
const Review = require('../models/Review');

const repo = new FileRepository(
  path.join(__dirname, '../data/csv/reviews.csv'),
  Review.fromCSV,
  Review.csvHeader
);

const reviewService = new ReviewService(repo);

exports.getReviews = (req, res) => {
  try {
    const { providerId } = req.query;
    if (providerId) {
      return res.json(reviewService.getReviewsByProvider(providerId));
    }
    res.json(reviewService.getAllReviews());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReviewById = (req, res) => {
  try {
    const review = reviewService.getReviewById(Number(req.params.id));
    if (!review) return res.status(404).json({ error: 'Review not found.' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createReview = (req, res) => {
  try {
    const created = reviewService.createReview(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteReview = (req, res) => {
  try {
    const result = reviewService.deleteReview(Number(req.params.id));
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
