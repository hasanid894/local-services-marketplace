/**
 * ServiceService — Business logic for services.
 * All methods async (compatible with both DB and CSV repositories).
 *
 * Note: Services use categoryId (FK), not a freeform category string.
 *       Use CategoryRepository.findOrCreate() before calling createService().
 */
class ServiceService {
  constructor(repository) {
    this.repository = repository;
  }

  async getAllServices(filter = {}) {
    // DB repo has getFiltered(); CSV repo also exposes it
    if (typeof this.repository.getFiltered === 'function') {
      return this.repository.getFiltered(filter);
    }
    return this.repository.getAll();
  }

  async getServiceById(id) {
    const numericId = Number(id);
    if (!Number.isFinite(numericId) || numericId <= 0) return null;
    return this.repository.getById(numericId);
  }

  async createService({ providerId, categoryId, title, description, price, location, latitude, longitude, isActive }) {
    const normalizedTitle = (title ?? '').trim();
    if (!normalizedTitle) throw new Error('Title cannot be empty.');

    const parsedPrice = Number(price);
    if (price === undefined || price === null || price === '' || isNaN(parsedPrice)) {
      throw new Error('Please enter a valid number for price.');
    }
    if (parsedPrice <= 0) throw new Error('Price must be greater than 0.');
    if (!categoryId)       throw new Error('Category is required.');

    return this.repository.add({
      providerId: Number(providerId) || 0,
      categoryId: Number(categoryId),
      title:      normalizedTitle,
      description: description || '',
      price:      parsedPrice,
      location:   location  || '',
      latitude:   latitude  ?? null,
      longitude:  longitude ?? null,
      isActive:   isActive  ?? true,
    });
  }

  async updateService(id, data) {
    const numericId = Number(id);
    const existing  = await this.repository.getById(numericId);
    if (!existing) throw new Error(`Item not found: no service with id ${id}.`);

    if (data.price !== undefined) {
      const p = Number(data.price);
      if (isNaN(p))  throw new Error('Please enter a valid number for price.');
      if (p <= 0)    throw new Error('Price must be greater than 0.');
    }

    if (data.title !== undefined && String(data.title).trim() === '') {
      throw new Error('Title cannot be empty.');
    }

    return this.repository.update(numericId, data);
  }

  async deleteService(id) {
    const numericId = Number(id);
    const deleted   = await this.repository.delete(numericId);
    if (!deleted) throw new Error(`Item not found: no service with id ${id}.`);
    return { message: 'Service deleted successfully.' };
  }

  async getServicesByProvider(providerId) {
    return this.getAllServices({ providerId: Number(providerId) });
  }
}

module.exports = ServiceService;
