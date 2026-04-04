/**
 * serviceService.test.js
 *
 * Tests for ServiceService — the business logic layer.
 * Uses an in-memory stub repository (no real file I/O) so tests are fast
 * and isolated. The same tests can be run against DatabaseRepository to
 * verify contract compatibility (repository swapping test).
 */

const ServiceService = require('../services/ServiceService');
const DatabaseRepository = require('../repositories/DatabaseRepository');

// ─── In-memory stub that mimics FileRepository / DatabaseRepository ──────────
class InMemoryRepository {
  constructor() {
    this._data = [];
    this._counter = 1;
  }
  getAll()          { return [...this._data]; }
  getById(id)       { return this._data.find(e => e.id === Number(id)) || null; }
  add(entity)       { entity.id = this._counter++; this._data.push({ ...entity }); return entity; }
  save()            { /* no-op */ }
  delete(id) {
    const i = this._data.findIndex(e => e.id === Number(id));
    if (i === -1) return false;
    this._data.splice(i, 1);
    return true;
  }
  update(id, data) {
    const i = this._data.findIndex(e => e.id === Number(id));
    if (i === -1) return null;
    Object.assign(this._data[i], data);
    return { ...this._data[i] };
  }
}

// ─── Helper: build a fresh service instance for each test ───────────────────
function makeService() {
  return new ServiceService(new InMemoryRepository());
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1 — add() — normal case
// ═══════════════════════════════════════════════════════════════════════════════
test('add() with valid data returns a service object with an id', () => {
  const svc = makeService();
  const result = svc.add({
    providerId: 1,
    title: 'Plumbing Fix',
    description: 'Fix leaks',
    category: 'Plumbing',
    location: 'Pristina',
    price: 20
  });

  expect(result).toBeDefined();
  expect(result.id).toBe(1);
  expect(result.title).toBe('Plumbing Fix');
  expect(result.price).toBe(20);
  expect(result.status).toBe('active');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2 — add() — border case: empty title
// ═══════════════════════════════════════════════════════════════════════════════
test('add() with empty title throws "Name cannot be empty"', () => {
  const svc = makeService();
  expect(() =>
    svc.add({ providerId: 1, title: '   ', price: 10 })
  ).toThrow('Name cannot be empty.');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3 — add() — border case: price <= 0
// ═══════════════════════════════════════════════════════════════════════════════
test('add() with price = 0 throws "Price must be greater than 0"', () => {
  const svc = makeService();
  expect(() =>
    svc.add({ providerId: 1, title: 'Valid Title', price: 0 })
  ).toThrow('Price must be greater than 0.');
});

test('add() with negative price throws an error', () => {
  const svc = makeService();
  expect(() =>
    svc.add({ providerId: 1, title: 'Valid Title', price: -5 })
  ).toThrow('Price must be greater than 0.');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4 — add() — border case: non-numeric price string ("abc")
// ═══════════════════════════════════════════════════════════════════════════════
test('add() with non-numeric price shows "Please enter a valid number"', () => {
  const svc = makeService();
  expect(() =>
    svc.add({ providerId: 1, title: 'Valid Title', price: 'abc' })
  ).toThrow('Please enter a valid number for price.');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5 — list() — filter by category (case-insensitive)
// ═══════════════════════════════════════════════════════════════════════════════
test('list() filters by category case-insensitively', () => {
  const svc = makeService();
  svc.add({ providerId: 1, title: 'Math Tutoring',  category: 'Education', location: 'Peja',     price: 15 });
  svc.add({ providerId: 2, title: 'Plumbing Fix',   category: 'Plumbing',  location: 'Pristina', price: 20 });
  svc.add({ providerId: 3, title: 'English Lessons', category: 'education', location: 'Prizren', price: 18 });

  const result = svc.list({ category: 'EDUCATION' });
  expect(result).toHaveLength(2);
  expect(result.every(s => s.category.toLowerCase() === 'education')).toBe(true);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6 — updateService() — non-existent id returns error
// ═══════════════════════════════════════════════════════════════════════════════
test('updateService() with non-existent id throws "Item not found"', () => {
  const svc = makeService();
  expect(() =>
    svc.updateService(999, { title: 'Ghost Service' })
  ).toThrow(/not found/i);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7 — deleteService() — non-existent id returns error
// ═══════════════════════════════════════════════════════════════════════════════
test('deleteService() with non-existent id throws "Item not found"', () => {
  const svc = makeService();
  expect(() =>
    svc.deleteService(999)
  ).toThrow(/not found/i);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8 — findById() — existing vs non-existing
// ═══════════════════════════════════════════════════════════════════════════════
test('findById() returns service when it exists', () => {
  const svc = makeService();
  const created = svc.add({ providerId: 1, title: 'House Cleaning', category: 'Cleaning', location: 'Prizren', price: 25 });
  const found = svc.findById(created.id);
  expect(found).not.toBeNull();
  expect(found.title).toBe('House Cleaning');
});

test('findById() returns null when id does not exist', () => {
  const svc = makeService();
  const result = svc.findById(999);
  expect(result).toBeNull();
});

test('findById() returns null for non-numeric id (no crash)', () => {
  const svc = makeService();
  const result = svc.findById('abc');
  expect(result).toBeNull();
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9 — Repository swapping: DatabaseRepository passes the same contract
// ═══════════════════════════════════════════════════════════════════════════════
test('ServiceService works identically when given DatabaseRepository', () => {
  // Swap the repository — ServiceService does NOT need to change at all
  const dbRepo = new DatabaseRepository('services');
  const svc = new ServiceService(dbRepo);

  const created = svc.add({
    providerId: 1,
    title: 'Electrical Repair',
    category: 'Electrical',
    location: 'Gjakova',
    price: 30
  });

  expect(created.id).toBeDefined();
  expect(created.title).toBe('Electrical Repair');

  const found = svc.findById(created.id);
  expect(found).not.toBeNull();
  expect(found.price).toBe(30);

  const updated = svc.updateService(created.id, { price: 35 });
  expect(updated.price).toBe(35);

  const deleted = svc.deleteService(created.id);
  expect(deleted.message).toMatch(/deleted/i);

  expect(svc.findById(created.id)).toBeNull();
});
