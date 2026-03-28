class ServiceService {
  constructor(repository) {
    this.repository = repository;
  }

    getAllServices(filter = {}) {
    let services = this.repository.getAll();

    if (filter.category) {
      services = services.filter(s => s.category === filter.category);
    }

    if (filter.location) {
      services = services.filter(s =>
        s.location.toLowerCase().includes(filter.location.toLowerCase())
      );
    }

    return services;
  }

  getServiceById(id) {
    return this.repository.getById(id);
  }

  

  createService({ providerId, title, description, category, location, price }) {

    // Validime 
    if (!title || title.trim() === '') {
      throw new Error('Title cannot be empty.');
    }

    if (!price || price <= 0) {
      throw new Error('Price must be greater than 0.');
    }

    const service = {
      id: null,
      providerId,
      title: title.trim(),
      description:description||'',
      category: category || '',
      location: location || '',
      price: Number(price),
      status: 'active',
      createdAt: new Date().toISOString()
    };

    return this.repository.add(service);
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
    return this.getAllServices({ providerId });
  }
}

module.exports = ServiceService;
