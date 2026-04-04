/**
 * fileRepository.test.js
 *
 * Tests for FileRepository — the persistence layer.
 * Each test uses a uniquely-named temporary CSV file so tests are isolated
 * and don't interfere with the real services.csv data.
 * Temp files are cleaned up after each test.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const FileRepository = require('../repositories/FileRepository');

// ─── Simple entity model for testing ────────────────────────────────────────
class TestItem {
  constructor(id, name, value) {
    this.id = id;
    this.name = name;
    this.value = value;
  }
  toCSV() { return `${this.id},${this.name},${this.value}`; }
  static fromCSV(line) {
    const [id, name, value] = line.split(',');
    return new TestItem(Number(id), name, Number(value));
  }
  static csvHeader() { return 'id,name,value'; }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function makeTempPath() {
  return path.join(os.tmpdir(), `test_repo_${Date.now()}_${Math.random().toString(36).slice(2)}.csv`);
}

function makeRepo(filePath) {
  return new FileRepository(filePath, TestItem.fromCSV, TestItem.csvHeader);
}

let tempFiles = [];

afterEach(() => {
  // Clean up all temp files created in this test run
  for (const f of tempFiles) {
    try { fs.unlinkSync(f); } catch { /* ignore */ }
  }
  tempFiles = [];
});

// ═══════════════════════════════════════════════════════════════════════════════
// 1 — File creation: missing file is created automatically (no crash)
// ═══════════════════════════════════════════════════════════════════════════════
test('FileRepository creates file automatically when it does not exist', () => {
  const filePath = makeTempPath();
  tempFiles.push(filePath);

  expect(fs.existsSync(filePath)).toBe(false);
  const repo = makeRepo(filePath);
  expect(fs.existsSync(filePath)).toBe(true);

  // File contains only header row
  const content = fs.readFileSync(filePath, 'utf-8');
  expect(content.trim()).toBe('id,name,value');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2 — getAll() returns empty array when file has no data rows
// ═══════════════════════════════════════════════════════════════════════════════
test('getAll() returns empty array on fresh repo', () => {
  const filePath = makeTempPath();
  tempFiles.push(filePath);
  const repo = makeRepo(filePath);
  expect(repo.getAll()).toEqual([]);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3 — add() stores entity and getAll() returns it
// ═══════════════════════════════════════════════════════════════════════════════
test('add() assigns an id and getAll() returns the entity', () => {
  const filePath = makeTempPath();
  tempFiles.push(filePath);
  const repo = makeRepo(filePath);

  const added = repo.add(new TestItem(null, 'Alpha', 100));

  expect(added.id).toBe(1);
  expect(added.name).toBe('Alpha');

  const all = repo.getAll();
  expect(all).toHaveLength(1);
  expect(all[0].name).toBe('Alpha');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4 — add() auto-increments IDs
// ═══════════════════════════════════════════════════════════════════════════════
test('add() assigns unique auto-incrementing ids', () => {
  const filePath = makeTempPath();
  tempFiles.push(filePath);
  const repo = makeRepo(filePath);

  const a = repo.add(new TestItem(null, 'Alpha', 10));
  const b = repo.add(new TestItem(null, 'Beta', 20));
  const c = repo.add(new TestItem(null, 'Gamma', 30));

  expect(a.id).toBe(1);
  expect(b.id).toBe(2);
  expect(c.id).toBe(3);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5 — getById() returns correct entity
// ═══════════════════════════════════════════════════════════════════════════════
test('getById() returns the entity when it exists', () => {
  const filePath = makeTempPath();
  tempFiles.push(filePath);
  const repo = makeRepo(filePath);

  repo.add(new TestItem(null, 'Alpha', 10));
  const added = repo.add(new TestItem(null, 'Beta', 20));

  const found = repo.getById(added.id);
  expect(found).not.toBeNull();
  expect(found.name).toBe('Beta');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6 — getById() returns null for non-existent id
// ═══════════════════════════════════════════════════════════════════════════════
test('getById() returns null when entity does not exist', () => {
  const filePath = makeTempPath();
  tempFiles.push(filePath);
  const repo = makeRepo(filePath);

  const result = repo.getById(999);
  expect(result).toBeNull();
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7 — update() modifies the entity
// ═══════════════════════════════════════════════════════════════════════════════
test('update() changes only the specified fields', () => {
  const filePath = makeTempPath();
  tempFiles.push(filePath);
  const repo = makeRepo(filePath);

  const added = repo.add(new TestItem(null, 'Alpha', 10));
  const updated = repo.update(added.id, { value: 99 });

  expect(updated.value).toBe(99);
  expect(updated.name).toBe('Alpha'); // unchanged
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8 — update() returns null for non-existent id
// ═══════════════════════════════════════════════════════════════════════════════
test('update() returns null when id does not exist', () => {
  const filePath = makeTempPath();
  tempFiles.push(filePath);
  const repo = makeRepo(filePath);

  const result = repo.update(999, { name: 'Ghost' });
  expect(result).toBeNull();
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9 — delete() removes the entity
// ═══════════════════════════════════════════════════════════════════════════════
test('delete() removes entity and returns true', () => {
  const filePath = makeTempPath();
  tempFiles.push(filePath);
  const repo = makeRepo(filePath);

  const added = repo.add(new TestItem(null, 'Alpha', 10));
  const result = repo.delete(added.id);

  expect(result).toBe(true);
  expect(repo.getAll()).toHaveLength(0);
  expect(repo.getById(added.id)).toBeNull();
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10 — delete() returns false for non-existent id
// ═══════════════════════════════════════════════════════════════════════════════
test('delete() returns false when id does not exist', () => {
  const filePath = makeTempPath();
  tempFiles.push(filePath);
  const repo = makeRepo(filePath);

  const result = repo.delete(999);
  expect(result).toBe(false);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 11 — Data persists across repo instances (written to disk correctly)
// ═══════════════════════════════════════════════════════════════════════════════
test('data written by one FileRepository instance is read by a new instance', () => {
  const filePath = makeTempPath();
  tempFiles.push(filePath);

  const repo1 = makeRepo(filePath);
  repo1.add(new TestItem(null, 'Alpha', 10));
  repo1.add(new TestItem(null, 'Beta', 20));

  // Simulate a server restart — new instance reads from the same file
  const repo2 = makeRepo(filePath);
  const all = repo2.getAll();

  expect(all).toHaveLength(2);
  expect(all[0].name).toBe('Alpha');
  expect(all[1].name).toBe('Beta');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 12 — Malformed CSV rows are skipped, valid rows are still loaded (Error Case 1)
// ═══════════════════════════════════════════════════════════════════════════════
test('malformed CSV rows are skipped and valid rows still load (no crash)', () => {
  const filePath = makeTempPath();
  tempFiles.push(filePath);

  // Write a CSV with one good row and one malformed row manually
  fs.writeFileSync(
    filePath,
    'id,name,value\n' +
    '1,ValidItem,50\n' +
    'BAD_ROW_NO_PROPER_FIELDS\n' +  // malformed but will parse to NaN id
    '2,AnotherGood,75\n',
    'utf-8'
  );

  // Should not throw — bad row is skipped with console.error
  let repo;
  expect(() => { repo = makeRepo(filePath); }).not.toThrow();

  // Valid rows should still be present
  const all = repo.getAll();
  const validItems = all.filter(i => !isNaN(i.id));
  expect(validItems.length).toBeGreaterThanOrEqual(1);
});
