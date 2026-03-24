/**
 * Service Model
 * Represents a service offered by a Provider in the Local Services Marketplace.
 */
class Service {
  /**
   * @param {number} id
   * @param {number} providerId
   * @param {string} title
   * @param {string} description
   * @param {string} category
   * @param {string} location
   * @param {number} price
   * @param {'active'|'inactive'} status
   * @param {string} createdAt
   */
  constructor(id, providerId, title, description, category, location, price, status = 'active', createdAt = new Date().toISOString()) {
    this.id = id;
    this.providerId = providerId;
    this.title = title;
    this.description = description;
    this.category = category;
    this.location = location;
    this.price = price;
    this.status = status;
    this.createdAt = createdAt;
  }
 
  toCSV() {
    return `${this.id},${this.providerId},${this.title},${this.description},${this.category},${this.location},${this.price},${this.status},${this.createdAt}`;
  }
 
  static fromCSV(line) {
    const [id, providerId, title, description, category, location, price, status, createdAt] = line.split(',');
    return new Service(Number(id), Number(providerId), title, description, category, location, Number(price), status, createdAt);
  }
 
  static csvHeader() {
    return 'id,providerId,title,description,category,location,price,status,createdAt';
  }
}
 
module.exports = Service;
