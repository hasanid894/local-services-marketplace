/**
 * Booking Model — PostgreSQL columns + CSV persistence.
 *
 * Status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
 * Job fields: where the work happens + context for triage and quoting.
 */
class Booking {
  constructor(data) {
    if (typeof data === 'number') {
      // Legacy positional constructor kept for callers that rely on arity (avoid).
      throw new Error('Booking expects a plain object. Use Booking.fromCSV or explicit object shape.');
    }
    const o = data || {};
    this.id = o.id;
    this.userId = o.userId;
    this.serviceId = o.serviceId;
    this.providerId = o.providerId;
    this.scheduledDate = o.scheduledDate;
    this.status = (o.status || 'pending').toLowerCase();
    this.totalPrice = o.totalPrice != null && o.totalPrice !== '' ? Number(o.totalPrice) : null;
    this.jobAddress = o.jobAddress != null ? String(o.jobAddress) : '';
    this.jobCity = o.jobCity != null ? String(o.jobCity) : '';
    this.preferredTime = o.preferredTime || 'flexible';
    this.customerNotes = o.customerNotes != null ? String(o.customerNotes) : '';
    this.accessNotes = o.accessNotes != null ? String(o.accessNotes) : '';
    this.createdAt = o.createdAt || new Date().toISOString();
  }

  /**
   * CSV field quoting when value contains commas, quotes, or newlines.
   * @private
   */
  static _csvField(v) {
    if (v == null || v === '') return '';
    const s = String(v).replace(/\r\n/g, '\n').replace(/\n/g, ' ');
    if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  /** Parse one CSV row with optional RFC-style quoted fields. */
  static _parseCsvLine(line) {
    const out = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const c = line[i];
      if (inQuotes) {
        if (c === '"') {
          if (line[i + 1] === '"') {
            cur += '"';
            i += 1;
          } else inQuotes = false;
        } else cur += c;
      } else if (c === '"') inQuotes = true;
      else if (c === ',') {
        out.push(cur);
        cur = '';
      } else cur += c;
    }
    out.push(cur);
    return out;
  }

  static _normalizeStatus(raw) {
    const s = String(raw || '').trim().toLowerCase();
    const aliases = {
      approved: 'confirmed',
      reject: 'cancelled',
      rejected: 'cancelled',
      cancelled: 'cancelled',
      cancel: 'cancelled',
      complete: 'completed',
      completed: 'completed',
      confirmed: 'confirmed',
      pending: 'pending',
    };
    return aliases[s] || s || 'pending';
  }

  static _isNumericPriceCol(col) {
    if (col == null || col === '') return true;
    return /^-?\d+(\.\d+)?$/.test(String(col).trim());
  }

  toCSV() {
    const row = [
      this.id,
      this.userId,
      this.serviceId,
      this.providerId,
      this.scheduledDate,
      this.status,
      this.totalPrice != null ? this.totalPrice : '',
      this.jobAddress,
      this.jobCity,
      this.preferredTime || 'flexible',
      this.customerNotes,
      this.accessNotes,
      this.createdAt,
    ].map(Booking._csvField);
    return row.join(',');
  }

  static fromCSV(line) {
    const c = Booking._parseCsvLine(line);
    /** New format — 13 fields */
    if (c.length >= 13) {
      const [
        id, userId, serviceId, providerId, scheduledDate, status, totalPriceRaw,
        jobAddress, jobCity, preferredTime, customerNotes, accessNotes, createdAt,
      ] = c;
      const tp = totalPriceRaw === '' || totalPriceRaw == null ? null : Number(totalPriceRaw);
      return new Booking({
        id: Number(id),
        userId: Number(userId),
        serviceId: Number(serviceId),
        providerId: Number(providerId),
        scheduledDate,
        status: Booking._normalizeStatus(status),
        totalPrice: Number.isFinite(tp) ? tp : null,
        jobAddress: jobAddress || '',
        jobCity: jobCity || '',
        preferredTime: preferredTime || 'flexible',
        customerNotes: customerNotes || '',
        accessNotes: accessNotes || '',
        createdAt,
      });
    }

    /** Legacy ~8-column row (either totalPrice+created_at or notes+created_at). */
    if (c.length === 8) {
      const [
        id, userId, serviceId, providerId, scheduledDate, status, colSix, createdAt,
      ] = c;
      const normalizedStatus = Booking._normalizeStatus(status);
      let totalPrice = null;
      let customerNotes = '';

      if (Booking._isNumericPriceCol(colSix)) {
        const tp = colSix === '' || colSix == null ? null : Number(colSix);
        totalPrice = Number.isFinite(tp) ? tp : null;
      } else {
        customerNotes = colSix || '';
      }

      return new Booking({
        id: Number(id),
        userId: Number(userId),
        serviceId: Number(serviceId),
        providerId: Number(providerId),
        scheduledDate,
        status: normalizedStatus,
        totalPrice,
        customerNotes,
        preferredTime: 'flexible',
        createdAt,
      });
    }

    throw new Error(`Unsupported booking CSV column count (${c.length}). Expected 8 (legacy) or 13+.`);
  }

  static csvHeader() {
    return (
      'id,userId,serviceId,providerId,scheduledDate,status,totalPrice,' +
      'jobAddress,jobCity,preferredTime,customerNotes,accessNotes,createdAt'
    );
  }
}

module.exports = Booking;
