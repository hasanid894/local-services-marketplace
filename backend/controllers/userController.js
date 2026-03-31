const FileRepository = require('../repositories/FileRepository');
const UserService = require('../services/UserService');
const User = require('../models/User');
const path = require('path');

const repo = new FileRepository(
  path.join(__dirname, '../data/csv/users.csv'),
  User.fromCSV,
  User.csvHeader
);

const service = new UserService(repo);

exports.getUsers = (req, res) => {
  res.json(service.getAllUsers());
};

exports.getUser = (req, res) => {
  const user = service.getUserById(Number(req.params.id));
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
};

exports.createUser = (req, res) => {
  try {
    const user = service.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateUser = (req, res) => {
  try {
    const updated = service.updateUser(Number(req.params.id), req.body);
    res.json(updated);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.deleteUser = (req, res) => {
  try {
    const result = service.deleteUser(Number(req.params.id));
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
