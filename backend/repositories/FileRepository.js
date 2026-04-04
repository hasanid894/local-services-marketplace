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
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      if (!fs.existsSync(this.filePath)) {
        fs.writeFileSync(this.filePath, this.csvHeader() + '\n', 'utf-8');
        console.log(`[FileRepository] File not found, creating new file: ${this.filePath}`);
      }
    } catch (err) {
      console.error(`[FileRepository] Error ensuring file exists: ${err.message}`);
    }
  }

  _load() {
    try {
      const content = fs.readFileSync(this.filePath, 'utf-8');
      const lines = content
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

      // Skip the header row, parse each data row individually
      this._data = [];
      const dataLines = lines.slice(1);

      for (const line of dataLines) {
        try {
          const entity = this.fromCSV(line);
          if (entity && entity.id !== undefined) {
            this._data.push(entity);
          } else {
            console.error(`[FileRepository] Skipping invalid row (missing id): "${line}"`);
          }
        } catch (parseErr) {
          // Case 1: malformed CSV row — skip and continue, never crash
          console.error(`[FileRepository] Skipping malformed row: "${line}" — ${parseErr.message}`);
        }
      }
    } catch (err) {
      // File read error — show friendly message and start with empty data
      console.error(`[FileRepository] File not found, creating new file: ${this.filePath}`);
      this._data = [];
      this._ensureFile();
    }
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
    try {
      const lines = [
        this.csvHeader(),
        ...this._data.map(e =>
          typeof e.toCSV === 'function'
            ? e.toCSV()
            : Object.values(e).join(',')
        )
      ];

      fs.writeFileSync(this.filePath, lines.join('\n') + '\n', 'utf-8');
    } catch (err) {
      console.error(`[FileRepository] Error saving data to file: ${err.message}`);
      throw new Error(`Failed to save data: ${err.message}`);
    }
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
