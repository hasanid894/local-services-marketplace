const path = require('path');
const FileRepository = require('../repositories/FileRepository');
const DatabaseRepository = require('../repositories/DatabaseRepository');
const ServiceService = require('../services/ServiceService');
const Service = require('../models/Service');

// ─── Repository Factory ────────────────────────────────────────────────────
// Set USE_DB=true in your environment (e.g. in a .env file or shell) to switch
// from the CSV-backed FileRepository to the DatabaseRepository.
// Example:
//   Windows PowerShell:  $env:USE_DB="true" ; node server.js
//   Linux/Mac:           USE_DB=true node server.js
//
// The ServiceService and all handlers below are NOT changed — only the
// repository instance is swapped. This is the Open/Closed Principle in action.

function createRepository() {
  if (process.env.USE_DB === 'true') {
    console.log('[Config] USE_DB=true → using DatabaseRepository (in-memory skeleton).');
    return new DatabaseRepository('services');
  }

  console.log('[Config] USE_DB not set → using FileRepository (CSV).');
  return new FileRepository(
    path.join(__dirname, '../data/csv/services.csv'),
    Service.fromCSV,
    Service.csvHeader
  );
}

const repo = createRepository();
const service = new ServiceService(repo);

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Validate that a route param is a positive integer.
 * Returns the numeric ID on success, or sends a 400 response and returns null.
 */
function parseId(req, res) {
  const id = Number(req.params.id);
  if (!req.params.id || isNaN(id) || !Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Please enter a valid ID (positive integer).' });
    return null;
  }
  return id;
}

// ─── Handlers ──────────────────────────────────────────────────────────────

/**
 * GET /api/services
 */
exports.getServices = (req, res) => {
  try {
    const { category, location, providerId } = req.query;

    const services = service.getAllServices({ category, location, providerId });
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
    const id = parseId(req, res);
    if (id === null) return;              // 400 already sent

    const found = service.getServiceById(id);
    if (!found) {
      return res.status(404).json({ error: `Item not found: no service with id ${id}.` });
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
    const id = parseId(req, res);
    if (id === null) return;              // 400 already sent

    const existing = service.getServiceById(id);
    if (!existing) {
      return res.status(404).json({ error: `Item not found: no service with id ${id}.` });
    }

    if (req.user?.role === 'provider' && existing.providerId !== req.user.id) {
      return res.status(403).json({ error: 'Providers can update only their own services.' });
    }

    const updated = service.updateService(id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * DELETE /api/services/:id
 */
exports.deleteService = (req, res) => {
  try {
    const id = parseId(req, res);
    if (id === null) return;              // 400 already sent

    const existing = service.getServiceById(id);
    if (!existing) {
      return res.status(404).json({ error: `Item not found: no service with id ${id}.` });
    }

    if (req.user?.role === 'provider' && existing.providerId !== req.user.id) {
      return res.status(403).json({ error: 'Providers can delete only their own services.' });
    }

    const result = service.deleteService(id);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
