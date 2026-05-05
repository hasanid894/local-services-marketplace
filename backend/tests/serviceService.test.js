/**
 * serviceService.test.js
 *
 * Tests for ServiceService — the business logic layer.
 * Uses an in-memory stub repository (no real file I/O or DB connection)
 * so tests are fast and entirely isolated.
 *
 * METHOD NAMES MUST MATCH THE REAL ServiceService API:
 *   createService()    — was incorrectly called add()
 *   getAllServices()   — was incorrectly called list()
 *   getServiceById()   — was incorrectly called findById()
 *   updateService()    — correct
 *   deleteService()    — correct
 */

const ServiceService = require('../services/ServiceService');

// ─── In-memory stub that satisfies IRepository ───────────────────────────────
// All methods return Promises to match the real async repositories.
class InMemoryRepository {
  constructor() {
    this._data = [];
    this._counter = 1;
  }

  async getAll() { return [...this._data]; }

  async getById(id) {
    return this._data.find(e => e.id === Number(id)) || null;
  }

  async add(entity) {
    const record = { ...entity, id: this._counter++ };
    this._data.push(record);
    return { ...record };
  }

  async save() { /* no-op — CSV compatibility shim */ }

  async delete(id) {
    const i = this._data.findIndex(e => e.id === Number(id));
    if (i === -1) return false;
    this._data.splice(i, 1);
    return true;
  }

  async update(id, data) {
    const i = this._data.findIndex(e => e.id === Number(id));
    if (i === -1) return null;
    Object.assign(this._data[i], data);
    return { ...this._data[i] };
  }
}

// ─── Factory: fresh service + repository for every test ─────────────────────
function makeService() {
  return new ServiceService(new InMemoryRepository());
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1 — createService() — happy path
// ═══════════════════════════════════════════════════════════════════════════════
test('createService() with valid data returns a service object with an id', async () => {
  const svc = makeService();
  const result = await svc.createService({
    providerId: 1,
    categoryId: 2,
    title: 'Plumbing Fix',
    description: 'Fix leaks',
    location: 'Pristina',
    price: 20,
  });

  expect(result).toBeDefined();
  expect(result.id).toBe(1);
  expect(result.title).toBe('Plumbing Fix');
  expect(result.price).toBe(20);
  // isActive defaults to true
  expect(result.isActive).toBe(true);
});

test('createService() persists imageUrl on creation', async () => {
  const svc = makeService();
  const imageUrl = 'https://example.com/photo.jpg';
  const result = await svc.createService({
    providerId: 1,
    categoryId: 2,
    title: 'Cleaning Service',
    description: 'Deep clean',
    location: 'Prizren',
    price: 50,
    imageUrl,
  });

  expect(result.imageUrl).toBe(imageUrl);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2 — createService() — empty title is rejected
// ═══════════════════════════════════════════════════════════════════════════════
test('createService() with empty title throws "Title cannot be empty"', async () => {
  const svc = makeService();
  await expect(
    svc.createService({ providerId: 1, categoryId: 2, title: '   ', price: 10 })
  ).rejects.toThrow('Title cannot be empty.');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3 — createService() — price = 0 is rejected
// ═══════════════════════════════════════════════════════════════════════════════
test('createService() with price = 0 throws "Price must be greater than 0"', async () => {
  const svc = makeService();
  await expect(
    svc.createService({ providerId: 1, categoryId: 2, title: 'Valid Title', price: 0 })
  ).rejects.toThrow('Price must be greater than 0.');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4 — createService() — negative price is rejected
// ═══════════════════════════════════════════════════════════════════════════════
test('createService() with negative price throws "Price must be greater than 0"', async () => {
  const svc = makeService();
  await expect(
    svc.createService({ providerId: 1, categoryId: 2, title: 'Valid Title', price: -5 })
  ).rejects.toThrow('Price must be greater than 0.');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5 — createService() — non-numeric price string is rejected
// ═══════════════════════════════════════════════════════════════════════════════
test('createService() with non-numeric price throws "valid number" error', async () => {
  const svc = makeService();
  await expect(
    svc.createService({ providerId: 1, categoryId: 2, title: 'Valid Title', price: 'abc' })
  ).rejects.toThrow('Please enter a valid number for price.');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6 — createService() — missing categoryId is rejected
// ═══════════════════════════════════════════════════════════════════════════════
test('createService() without categoryId throws "Category is required"', async () => {
  const svc = makeService();
  await expect(
    svc.createService({ providerId: 1, title: 'Valid Title', price: 20 })
  ).rejects.toThrow('Category is required.');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7 — getAllServices() — returns all services
// ═══════════════════════════════════════════════════════════════════════════════
test('getAllServices() returns all created services', async () => {
  const svc = makeService();
  await svc.createService({ providerId: 1, categoryId: 1, title: 'Math Tutoring', location: 'Peja', price: 15 });
  await svc.createService({ providerId: 2, categoryId: 2, title: 'Plumbing Fix', location: 'Pristina', price: 20 });

  const results = await svc.getAllServices();
  expect(results).toHaveLength(2);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8 — getServiceById() — returns correct service
// ═══════════════════════════════════════════════════════════════════════════════
test('getServiceById() returns the service when it exists', async () => {
  const svc = makeService();
  const created = await svc.createService({
    providerId: 1, categoryId: 3, title: 'House Cleaning', location: 'Prizren', price: 25,
  });

  const found = await svc.getServiceById(created.id);
  expect(found).not.toBeNull();
  expect(found.title).toBe('House Cleaning');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9 — getServiceById() — returns null for non-existent id
// ═══════════════════════════════════════════════════════════════════════════════
test('getServiceById() returns null when id does not exist', async () => {
  const svc = makeService();
  const result = await svc.getServiceById(999);
  expect(result).toBeNull();
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10 — getServiceById() — returns null for a non-numeric id (no crash)
// ═══════════════════════════════════════════════════════════════════════════════
test('getServiceById() returns null for a non-numeric id without throwing', async () => {
  const svc = makeService();
  const result = await svc.getServiceById('abc');
  expect(result).toBeNull();
});

// ═══════════════════════════════════════════════════════════════════════════════
// 11 — updateService() — non-existent id throws "not found"
// ═══════════════════════════════════════════════════════════════════════════════
test('updateService() with non-existent id throws "Item not found"', async () => {
  const svc = makeService();
  await expect(
    svc.updateService(999, { title: 'Ghost Service' })
  ).rejects.toThrow(/not found/i);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 12 — updateService() — invalid price in update is rejected
// ═══════════════════════════════════════════════════════════════════════════════
test('updateService() rejects a price update of 0', async () => {
  const svc = makeService();
  const created = await svc.createService({
    providerId: 1, categoryId: 1, title: 'Service', price: 10,
  });
  await expect(
    svc.updateService(created.id, { price: 0 })
  ).rejects.toThrow('Price must be greater than 0.');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 13 — deleteService() — non-existent id throws "not found"
// ═══════════════════════════════════════════════════════════════════════════════
test('deleteService() with non-existent id throws "Item not found"', async () => {
  const svc = makeService();
  await expect(
    svc.deleteService(999)
  ).rejects.toThrow(/not found/i);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 14 — deleteService() — deletes an existing service and returns message
// ═══════════════════════════════════════════════════════════════════════════════
test('deleteService() removes an existing service and returns success message', async () => {
  const svc = makeService();
  const created = await svc.createService({
    providerId: 1, categoryId: 1, title: 'To Be Deleted', price: 10,
  });

  const result = await svc.deleteService(created.id);
  expect(result.message).toMatch(/deleted/i);

  // Confirm it is no longer retrievable
  const found = await svc.getServiceById(created.id);
  expect(found).toBeNull();
});
