/**
 * serviceController.js
 *
 * Handles all /api/services routes.
 *
 * Improvement (Weakness 2 — Dependency Injection):
 *   serviceService is now imported from container.js instead of being
 *   instantiated here. The controller has zero wiring code.
 */

const { serviceService } = require('../container');

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseId(req, res) {
  const id = Number(req.params.id);
  if (!req.params.id || isNaN(id) || !Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Please enter a valid ID (positive integer).' });
    return null;
  }
  return id;
}

// ── Handlers ──────────────────────────────────────────────────────────────────

/**
 * GET /api/services
 * Query params: categoryId, location, providerId, activeOnly
 */
exports.getServices = async (req, res) => {
  try {
    const { categoryId, location, providerId, activeOnly } = req.query;
    const filter = {
      categoryId: categoryId || undefined,
      location: location || undefined,
      providerId: providerId || undefined,
      activeOnly: activeOnly !== 'false', // default true
    };
    const services = await serviceService.getAllServices(filter);
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/services/:id
 */
exports.getServiceById = async (req, res) => {
  try {
    const id = parseId(req, res);
    if (id === null) return;
    const found = await serviceService.getServiceById(id);
    if (!found) return res.status(404).json({ error: `No service with id ${id}.` });
    res.json(found);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/services
 * Body: { providerId, categoryId, title, description, price, location, latitude, longitude }
 */
exports.createService = async (req, res) => {
  try {
    const payload = { ...req.body };
    // Inject the authenticated provider's id if they don't supply one
    if (req.user?.role === 'provider' && !payload.providerId) {
      payload.providerId = req.user.id;
    }
    const created = await serviceService.createService(payload);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * PUT /api/services/:id
 */
exports.updateService = async (req, res) => {
  try {
    const id = parseId(req, res);
    if (id === null) return;

    const existing = await serviceService.getServiceById(id);
    if (!existing) return res.status(404).json({ error: `No service with id ${id}.` });

    const currentRole = String(req.user?.role || '').toLowerCase();
    if (currentRole === 'provider' && existing.providerId !== req.user.id) {
      return res.status(403).json({ error: 'Providers can update only their own services.' });
    }

    const updated = await serviceService.updateService(id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * DELETE /api/services/:id
 */
exports.deleteService = async (req, res) => {
  try {
    const id = parseId(req, res);
    if (id === null) return;

    const existing = await serviceService.getServiceById(id);
    if (!existing) return res.status(404).json({ error: `No service with id ${id}.` });

    const currentRole = String(req.user?.role || '').toLowerCase();
    if (currentRole === 'provider' && existing.providerId !== req.user.id) {
      return res.status(403).json({ error: 'Providers can delete only their own services.' });
    }

    const result = await serviceService.deleteService(id);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
