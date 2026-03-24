/**
 * Booking Model
 * Represents a reservation made by a User for a Service.
 */
class Booking {
  
  constructor(id, userId, serviceId, providerId, scheduledDate, status = 'Pending', notes = '', createdAt = new Date().toISOString()) {
    this.id = id;
    this.userId = userId;
    this.serviceId = serviceId;
    this.providerId = providerId;
    this.scheduledDate = scheduledDate;
    this.status = status;
    this.notes = notes;
    this.createdAt = createdAt;
  }
 
  toCSV() {
    return `${this.id},${this.userId},${this.serviceId},${this.providerId},${this.scheduledDate},${this.status},${this.notes},${this.createdAt}`;
  }
 
  static fromCSV(line) {
    const [id, userId, serviceId, providerId, scheduledDate, status, notes, createdAt] = line.split(',');
    return new Booking(Number(id), Number(userId), Number(serviceId), Number(providerId), scheduledDate, status, notes, createdAt);
  }
 
  static csvHeader() {
    return 'id,userId,serviceId,providerId,scheduledDate,status,notes,createdAt';
  }
}
 
module.exports = Booking;
