const fs = require('fs');
const path = require('path');
const IRepository = require('./IRepository');

class FileRepository extends IRepository {
  constructor(filePath, fromCSV, csvHeader) {
    super();
    this.filePath = filePath;
    this.fromCSV = fromCSV;
    this.csvHeader = csvHeader;
    this._data = [];

    this._ensureFile();
    this._load();
  }

  _ensureFile() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, this.csvHeader() + '\n', 'utf-8');
    }
  }

  _load() {
    const content = fs.readFileSync(this.filePath, 'utf-8');
    const lines = content.split('\n').filter(Boolean);
    this._data = lines.slice(1).map(line => this.fromCSV(line));
  }

  _nextId() {
    if (this._data.length === 0) return 1;
    return Math.max(...this._data.map(e => e.id)) + 1;
  }

  getAll() {
    return [...this._data];
  }

  getById(id) {
    return this._data.find(e => e.id === Number(id)) || null;
  }

  add(entity) {
    entity.id = this._nextId();
    this._data.push(entity);
    this.save();
    return entity;
  }

 save() {
  const lines = [
    this.csvHeader(),
    ...this._data.map(e =>
      typeof e.toCSV === 'function'
        ? e.toCSV()
        : Object.values(e).join(',')
    )
  ];

  fs.writeFileSync(this.filePath, lines.join('\n') + '\n', 'utf-8');
}

  delete(id) {
    const index = this._data.findIndex(e => e.id === Number(id));
    if (index === -1) return false;

    this._data.splice(index, 1);
    this.save();
    return true;
  }

  update(id, updatedData) {
    const index = this._data.findIndex(e => e.id === Number(id));
    if (index === -1) return null;

    Object.assign(this._data[index], updatedData);
    this.save();
    return this._data[index];
  }
}

module.exports = FileRepository;
