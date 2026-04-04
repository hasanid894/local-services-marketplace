const path = require('path');
const FileRepository = require('./FileRepository');
const Service = require('../models/Service');

/**
 * ServiceRepository — concrete FileRepository configured for services.csv.
 */
class ServiceRepository extends FileRepository {
  constructor() {
    super(
      path.join(__dirname, '../data/csv/services.csv'),
      Service.fromCSV,
      Service.csvHeader
    );
  }
}

module.exports = ServiceRepository;
