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
    return this.repository.getById(id);
  }

  add({ providerId, title, name, description, category, location, price }) {
    const normalizedTitle = (title ?? name ?? '').trim();
    if (!normalizedTitle) {
      throw new Error('Name cannot be empty.');
    }

    if (price === undefined || price === null || Number(price) <= 0) {
      throw new Error('Price must be greater than 0.');
    }

    const service = {
      id: null,
      providerId: Number(providerId) || 0,
      title: normalizedTitle,
      description: description || '',
      category: category || '',
      location: location || '',
      price: Number(price),
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
    const existing = this.repository.getById(id);
    if (!existing) {
      throw new Error('Service not found.');
    }

    // Optional validation during update
    if (data.price !== undefined && data.price <= 0) {
      throw new Error('Price must be greater than 0.');
    }

    if (data.title !== undefined && data.title.trim() === '') {
      throw new Error('Title cannot be empty.');
    }

    return this.repository.update(id, data);
  }

  deleteService(id) {
    const deleted = this.repository.delete(id);
    if (!deleted) throw new Error('Service not found.');
    return { message: 'Service deleted successfully.' };
  }

  //(Opsionale – për përdorim real në aplikacion)
   
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
