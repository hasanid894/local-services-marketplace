const FileRepository = require('../data/FileRepository');
const ServiceService = require('../services/ServiceService');
const Service = require('../models/Service');
const path = require('path');

const repo = new FileRepository(
  path.join(__dirname, '../data/csv/services.csv'),
  Service.fromCSV,
  Service.csvHeader
);

const service = new ServiceService(repo);

/**
 * GET /api/services
 */
exports.getServices = (req, res) => {
  try {
    const { category, location } = req.query;

    const services = service.getAllServices({
      category,
      location
    });

    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/services
 */
exports.createService = (req, res) => {
  try {
    const newService = service.createService(req.body);
    res.json(newService);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * PUT /api/services/:id
 */
exports.updateService = (req, res) => {
  try {
    const updated = service.updateService(Number(req.params.id), req.body);
    res.json(updated);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

/**
 * DELETE /api/services/:id
 */
exports.deleteService = (req, res) => {
  try {
    const result = service.deleteService(Number(req.params.id));
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
