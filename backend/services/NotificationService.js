/**
 * NotificationService — Shërbimi i njoftimeve.
 *
 * SOLID: Single Responsibility Principle (SRP)
 * Merret VETËM me gjenerimin dhe dërgimin e njoftimeve.
 *
 * Aktualisht lëshon njoftime në console (in-process).
 * Mund të zëvendësohet me email (nodemailer), SMS, ose push notifications
 * pa ndryshuar asnjë pjesë tjetër të aplikacionit (OCP).
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
