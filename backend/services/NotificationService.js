/**
 * NotificationService — In-process notification stub.
 *
 * Current implementation: logs events to the console via _log().
 * This is intentional for the development and demo phase.
 *
 * To upgrade to real notifications in production:
 *   - Email: replace _log() with nodemailer.sendMail()
 *   - SMS:   replace _log() with Twilio / AWS SNS send
 *   - Push:  replace _log() with Firebase Cloud Messaging
 *
 * This class follows OCP (Open/Closed Principle) — the public interface
 * (notifyBookingCreated, notifyBookingStatusChanged, etc.) never changes;
 * only _log() is replaced when adding a real transport.
 *
 * Weakness 7 fix: This service is now imported and used in the container.
 * authController calls notifyUserRegistered() after registration.
 * bookingController calls notifyBookingCreated() and notifyBookingStatusChanged().
 */
class NotificationService {
  /**
   * Njofto përdoruesin për konfirmimin e rezervimit.
   * @param {object} booking - booking-u i krijuar
   */
  notifyBookingCreated(booking) {
    this._log(`📅 New booking #${booking.id} created for service #${booking.serviceId} by user #${booking.userId}.`);
  }

  /**
   * Njofto ofruesin kur një rezervim ndryshon status.
   * @param {object} booking - booking-u i përditësuar
   */
  notifyBookingStatusChanged(booking) {
    this._log(`🔔 Booking #${booking.id} status changed to "${booking.status}".`);
  }

  /**
   * Njofto ofruesin kur një vlerësim i ri postohet.
   * @param {object} review - review-ja e re
   */
  notifyReviewPosted(review) {
    this._log(`⭐ New review for provider #${review.providerId}: rating ${review.rating}/5.`);
  }

  /**
   * Njofto kur regjistrohet një përdorues i ri.
   * @param {object} user - useri i ri
   */
  notifyUserRegistered(user) {
    this._log(`👤 New user registered: ${user.name} (${user.email}) as ${user.role}.`);
  }

  /**
   * Log interno — zëvendëso me një transport të vërtetë në prodhim.
   * @private
   */
  _log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[NotificationService] ${timestamp} — ${message}`);
  }
}

module.exports = NotificationService;
