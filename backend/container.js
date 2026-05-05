/**
 * container.js — Dependency Injection Container
 *
 * This file is the single place where all repositories and services
 * are instantiated. Controllers import the pre-built service instances
 * from here instead of creating their own dependencies.
 *
 * Benefits:
 *  - Controllers have zero wiring code — they are pure HTTP handlers
 *  - Swapping DB ↔ CSV mode requires changing only the repository
 *    factories in this one file (not in every controller)
 *  - In tests, this file can be mocked to inject stubs
 *
 * Pattern: Service Locator / Simple DI Container (no framework needed)
 */

// ── Repositories ─────────────────────────────────────────────────────────────
const { createUserRepository }    = require('./repositories/UserRepository');
const { createServiceRepository } = require('./repositories/ServiceRepository');
const { createBookingRepository } = require('./repositories/BookingRepository');
const { createReviewRepository }  = require('./repositories/ReviewRepository');

// ── Services ─────────────────────────────────────────────────────────────────
const AuthService         = require('./services/AuthService');
const ServiceService      = require('./services/ServiceService');
const BookingService      = require('./services/BookingService');
const ReviewService       = require('./services/ReviewService');
const UserService         = require('./services/UserService');
const NotificationService = require('./services/NotificationService');

// ── Instantiate repositories (once, at startup) ───────────────────────────────
const userRepository    = createUserRepository();
const serviceRepository = createServiceRepository();
const bookingRepository = createBookingRepository();
const reviewRepository  = createReviewRepository();

// ── Instantiate services (inject repositories as constructor arguments) ────────
const authService         = new AuthService(userRepository);
const serviceService      = new ServiceService(serviceRepository);
const bookingService      = new BookingService(bookingRepository);
const reviewService       = new ReviewService(reviewRepository, bookingService);
const userService         = new UserService(userRepository);
const notificationService = new NotificationService();

// ── Export for use in controllers ─────────────────────────────────────────────
module.exports = {
  authService,
  serviceService,
  bookingService,
  reviewService,
  userService,
  notificationService,
};
