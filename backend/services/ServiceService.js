class ServiceService {
  constructor(repository) {
    this.repository = repository;
  }

  getAllServices() {
    return this.repository.getAll();
  }

  getServiceById(id) {
    return this.repository.getById(id);
  }

  getServicesByProvider(providerId) {
    return this.repository.getAll().filter(s => s.providerId === Number(providerId));
  }

  getServicesByCategory(category) {
    return this.repository.getAll().filter(s => s.category === category);
  }

  getServicesByLocation(location) {
    return this.repository.getAll().filter(s =>
      s.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  createService({ providerId, title, description, category, location, price }) {
    const service = {
      id: null,
      providerId,
      title,
      description,
      category,
      location,
      price,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    return this.repository.add(service);
  }

  updateService(id, data) {
    const existing = this.repository.getById(id);
    if (!existing) throw new Error('Service not found.');
    return this.repository.update(id, data);
  }

  deleteService(id) {
    const deleted = this.repository.delete(id);
    if (!deleted) throw new Error('Service not found.');
    return { message: 'Service deleted successfully.' };
  }
}
