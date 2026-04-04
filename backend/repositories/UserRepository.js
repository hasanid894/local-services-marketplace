const path = require('path');
const FileRepository = require('./FileRepository');
const User = require('../models/User');

/**
 * UserRepository — concrete FileRepository configured for users.csv.
 * Extends FileRepository so controllers can import this directly
 * without repeating CSV path / parser / header arguments.
 */
class UserRepository extends FileRepository {
  constructor() {
    super(
      path.join(__dirname, '../data/csv/users.csv'),
      User.fromCSV,
      User.csvHeader
    );
  }
}

module.exports = UserRepository;
