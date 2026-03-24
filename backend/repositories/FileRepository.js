const fs = require('fs');
const path = require('path');
const IRepository = require('./IRepository');
 
/**
 * FileRepository - Implementim i IRepository që ruan/lexon nga CSV files.
 *
 * Parimi SOLID i zbatuar: Open/Closed Principle (OCP)
 * - Kjo klasë mund të zëvendësohet me DatabaseRepository pa ndryshuar Services apo Controllers.
 * - Single Responsibility Principle (SRP): kjo klasë merret VETËM me persistence në CSV.
 */
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
 
 
  /**
   * Krijon file CSV nëse nuk ekziston, me header.
   */
  _ensureFile() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, this.csvHeader() + '\n', 'utf-8');
    }
  }
 
  /**
   * Lexon dhe parse-on të dhënat nga CSV.
   */
  _load() {
    const content = fs.readFileSync(this.filePath, 'utf-8');
    const lines = content.split('\n').filter(Boolean);
    // Kapërcen header-in (rreshti i parë)
    this._data = lines.slice(1).map(line => this.fromCSV(line));
  }
 
  /**
   * Gjeneron ID autoincrement.
   */
  _nextId() {
    if (this._data.length === 0) return 1;
    return Math.max(...this._data.map(e => e.id)) + 1;
  }
 
 
  /**
   * Kthe të gjitha entitetet.

   */
  getAll() {
    return [...this._data];
  }
 
  /**
   * Kthe entitetin me ID-in e dhënë.
   */
  getById(id) {
    return this._data.find(e => e.id === Number(id)) || null;
  }
 
  /**
   * Shto një entitet të ri (ID gjenerohet automatikisht).
   */
  add(entity) {
    entity.id = this._nextId();
    this._data.push(entity);
    this.save();
    return entity;
  }
 
  /**
   * Ruaj të gjitha të dhënat në CSV.
   */
  save() {
    const lines = [this.csvHeader(), ...this._data.map(e => e.toCSV())];
    fs.writeFileSync(this.filePath, lines.join('\n') + '\n', 'utf-8');
  }
 
  /**
   * Fshij entitetin me ID-in e dhënë.
   */
  delete(id) {
    const index = this._data.findIndex(e => e.id === Number(id));
    if (index === -1) return false;
    this._data.splice(index, 1);
    this.save();
    return true;
  }
 
  /**
   * Përditëso entitetin me ID-in e dhënë.
   */
  update(id, updatedData) {
    const index = this._data.findIndex(e => e.id === Number(id));
    if (index === -1) return null;
    // Merge properties onto the existing class instance to preserve methods
    Object.assign(this._data[index], updatedData);
    this.save();
    return this._data[index];
  }
}
 
module.exports = FileRepository;
