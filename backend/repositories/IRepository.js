/**
 * IRepository - Interface / Kontratë bazë për të gjitha repositories.
 *
 * Parimi: Interface Segregation (SOLID - ISP) dhe Dependency Inversion (SOLID - DIP).
 * Çdo repository duhet të implementojë këto metoda.
 *
 * Kjo interface mundëson zëvendësimin e FileRepository me DatabaseRepository pa ndryshuar asnjë pjesë tjetër të aplikacionit (Open/Closed Principle).
 */
class IRepository {
  /**
   * Kthe të gjitha entitetet.
   */
  getAll() {
    throw new Error('getAll() must be implemented');
  }
 
  /**
   * Kthe një entitet sipas ID-it.
   */
  getById(id) {
    throw new Error('getById() must be implemented');
  }
 
  /**
   * Shto një entitet të ri.
   */
  add(entity) {
    throw new Error('add() must be implemented');
  }
 
  /**
   * Ruaj ndryshimet (persist to storage).
   */
  save() {
    throw new Error('save() must be implemented');
  }
 
  /**
   * Fshij një entitet sipas ID-it.
   */
  delete(id) {
    throw new Error('delete() must be implemented');
  }
 
  /**
   * Përditëso një entitet ekzistues.
   */
  update(id, updatedData) {
    throw new Error('update() must be implemented');
  }
}
 
module.exports = IRepository;
