const FileRepository = require('../repositories/FileRepository');
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
    const { category, location, providerId } = req.query;

    const services = service.getAllServices({
      category,
      location,
      providerId
    });

    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/services/:id
 */
exports.getServiceById = (req, res) => {
  try {
    const found = service.getServiceById(Number(req.params.id));
    if (!found) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    res.json(found);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/services
 */
exports.createService = (req, res) => {
  try {
    const payload = { ...req.body };
    if (req.user?.role === 'provider') {
      payload.providerId = req.user.id;
    }

    const newService = service.createService(payload);
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
    const existing = service.getServiceById(Number(req.params.id));
    if (!existing) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    if (req.user?.role === 'provider' && existing.providerId !== req.user.id) {
      return res.status(403).json({ error: 'Providers can update only their own services.' });
    }

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
    const existing = service.getServiceById(Number(req.params.id));
    if (!existing) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    if (req.user?.role === 'provider' && existing.providerId !== req.user.id) {
      return res.status(403).json({ error: 'Providers can delete only their own services.' });
    }

    const result = service.deleteService(Number(req.params.id));
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
