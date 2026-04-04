class ServiceService {
  constructor(repository) {
    this.repository = repository;
  }

  list(filter = {}) {
    let services = this.repository.getAll();

    if (filter.category && String(filter.category).trim()) {
      const categoryQuery = String(filter.category).trim().toLowerCase();
      services = services.filter(s =>
        String(s.category || '').toLowerCase().includes(categoryQuery)
      );
    }

    if (filter.location && String(filter.location).trim()) {
      services = services.filter(s =>
        String(s.location || '').toLowerCase().includes(String(filter.location).trim().toLowerCase())
      );
    }

    if (filter.providerId !== undefined && filter.providerId !== null && filter.providerId !== '') {
      services = services.filter(s => s.providerId === Number(filter.providerId));
    }

    return services;
  }

  findById(id) {
    // Case 3: invalid / non-numeric IDs — return null instead of crashing
    const numericId = Number(id);
    if (isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
      return null;
    }
    return this.repository.getById(numericId);
  }

  add({ providerId, title, name, description, category, location, price }) {
    const normalizedTitle = (title ?? name ?? '').trim();
    if (!normalizedTitle) {
      throw new Error('Name cannot be empty.');
    }

    // Case 2: invalid price input — clear message instead of NaN logic errors
    const parsedPrice = Number(price);
    if (price === undefined || price === null || price === '' || isNaN(parsedPrice)) {
      throw new Error('Please enter a valid number for price.');
    }
    if (parsedPrice <= 0) {
      throw new Error('Price must be greater than 0.');
    }

    const service = {
      id: null,
      providerId: Number(providerId) || 0,
      title: normalizedTitle,
      description: description || '',
      category: category || '',
      location: location || '',
      price: parsedPrice,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    return this.repository.add(service);
  }

  getAllServices(filter = {}) {
    return this.list(filter);
  }

  getServiceById(id) {
    return this.findById(id);
  }

  createService(payload) {
    return this.add(payload);
  }

  updateService(id, data) {
    const existing = this.repository.getById(Number(id));
    if (!existing) {
      throw new Error(`Item not found: no service with id ${id}.`);
    }

    // Validate price if provided
    if (data.price !== undefined) {
      const parsedPrice = Number(data.price);
      if (isNaN(parsedPrice)) {
        throw new Error('Please enter a valid number for price.');
      }
      if (parsedPrice <= 0) {
        throw new Error('Price must be greater than 0.');
      }
    }

    // Validate title if provided
    if (data.title !== undefined && data.title.trim() === '') {
      throw new Error('Title cannot be empty.');
    }

    return this.repository.update(id, data);
  }

  deleteService(id) {
    const deleted = this.repository.delete(id);
    if (!deleted) throw new Error(`Item not found: no service with id ${id}.`);
    return { message: 'Service deleted successfully.' };
  }

  // ── Convenience helpers ────────────────────────────────────────────────

  getServicesByCategory(category) {
    return this.getAllServices({ category });
  }

  getServicesByLocation(location) {
    return this.getAllServices({ location });
  }

  getServicesByProvider(providerId) {
    return this.getAllServices({ providerId: Number(providerId) });
  }
}

module.exports = ServiceService;
