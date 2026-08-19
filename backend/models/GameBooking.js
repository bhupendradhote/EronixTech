const db = require('../config/db');

const ACTIVE_STATUSES = ['held', 'confirmed', 'playing'];

class GameBooking {
  static async getById(id, connection = db) {
    const [rows] = await connection.execute(
      `SELECT b.*, d.name AS device_name, d.platform AS device_platform,
              g.name AS game_name, r.name AS rate_name
       FROM game_bookings b
       JOIN game_devices d ON d.id = b.device_id
       LEFT JOIN available_games g ON g.id = b.game_id
       LEFT JOIN game_rates r ON r.id = b.rate_id
       WHERE b.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async getTimeline(date) {
    const [rows] = await db.execute(
      `SELECT b.id, b.device_id, d.name AS device_name, d.platform AS device_platform,
              b.game_id, g.name AS game_name, b.rate_id, r.name AS rate_name,
              b.customer_name, b.customer_phone, b.booking_source, b.status,
              b.start_time, b.end_time, b.duration_minutes, b.total_price,
              b.notes, b.created_at
       FROM game_bookings b
       JOIN game_devices d ON d.id = b.device_id
       LEFT JOIN available_games g ON g.id = b.game_id
       LEFT JOIN game_rates r ON r.id = b.rate_id
       WHERE DATE(b.start_time) = ?
          OR DATE(b.end_time) = ?
          OR (b.start_time < CONCAT(?, ' 23:59:59') AND b.end_time > CONCAT(?, ' 00:00:00'))
       ORDER BY d.name, b.start_time`,
      [date, date, date, date]
    );
    return rows;
  }

  static async getActiveDevices(platform = null) {
    const params = [];
    let where = 'WHERE is_active = 1';
    if (platform) {
      where += ' AND UPPER(platform) = UPPER(?)';
      params.push(platform);
    }
    const [rows] = await db.execute(
      `SELECT id, name, platform FROM game_devices ${where} ORDER BY name`,
      params
    );
    return rows;
  }

  static async findOverlaps(deviceId, startTime, endTime, excludeId = null, connection = db) {
    const params = [deviceId, endTime, startTime];
    let exclude = '';
    if (excludeId) {
      exclude = ' AND id <> ?';
      params.push(excludeId);
    }
    const [rows] = await connection.execute(
      `SELECT * FROM game_bookings
       WHERE device_id = ?
         AND status IN ('held','confirmed','playing')
         AND start_time < ?
         AND end_time > ?
         ${exclude}
       ORDER BY start_time`,
      params
    );
    return rows;
  }

  static async createSerialized(data) {
    const connection = await db.getConnection();
    const lockName = `game_device_${data.device_id}`;
    
    try {
      await connection.beginTransaction();
      const [[lock]] = await connection.query('SELECT GET_LOCK(?, 5) AS acquired', [lockName]);
      if (!lock || Number(lock.acquired) !== 1) {
        throw Object.assign(new Error('Could not reserve device. Please retry.'), { code: 'LOCK_TIMEOUT' });
      }

      const conflicts = await this.findOverlaps(
        data.device_id,
        data.start_time,
        data.end_time,
        null,
        connection
      );
      
      if (conflicts.length) {
        const err = new Error('Selected device is already booked for this time range');
        err.code = 'BOOKING_CONFLICT';
        err.conflicts = conflicts;
        throw err;
      }

      const [result] = await connection.execute(
        `INSERT INTO game_bookings
          (device_id, game_id, rate_id, game_user_id, customer_id, customer_name, customer_phone,
           salesperson_id, salesperson_name, booking_source, status, start_time, end_time, duration_minutes,
           subtotal, discount_percent, discount_amount, tax_amount, round_off, total_price, 
           paid_amount, due_amount, payment_status, payment_mode, addons_data, notes, created_by_admin_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.device_id,
          data.game_id || null,
          data.rate_id || null,
          data.game_user_id || null,
          data.customer_id || null,
          data.customer_name || 'Walk-in Customer',
          data.customer_phone || null,
          data.salesperson_id || null,
          data.salesperson_name || null,
          data.booking_source || 'online',
          data.status || 'confirmed',
          data.start_time,
          data.end_time,
          data.duration_minutes,
          data.subtotal || 0,
          data.discount_percent || 0,
          data.discount_amount || 0,
          data.tax_amount || 0,
          data.round_off || 0,
          data.total_price || 0,
          data.paid_amount || 0,
          data.due_amount || 0,
          data.payment_status || 'pending',
          data.payment_mode || null,
          data.addons_data ? JSON.stringify(data.addons_data) : null,
          data.notes || null,
          data.created_by_admin_id || null
        ]
      );

      await connection.commit();
      await connection.query('SELECT RELEASE_LOCK(?)', [lockName]);
      return this.getById(result.insertId);
    } catch (error) {
      try { await connection.rollback(); } catch (_) {}
      try { await connection.query('SELECT RELEASE_LOCK(?)', [lockName]); } catch (_) {}
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateTimesSerialized(id, startTime, endTime, durationMinutes) {
    const existing = await this.getById(id);
    if (!existing) return null;

    const connection = await db.getConnection();
    const lockName = `game_device_${existing.device_id}`;
    
    try {
      await connection.beginTransaction();
      const [[lock]] = await connection.query('SELECT GET_LOCK(?, 5) AS acquired', [lockName]);
      if (!lock || Number(lock.acquired) !== 1) {
        throw Object.assign(new Error('Could not lock device. Please retry.'), { code: 'LOCK_TIMEOUT' });
      }
      const conflicts = await this.findOverlaps(existing.device_id, startTime, endTime, id, connection);
      if (conflicts.length) {
        const err = new Error('Cannot extend session because another booking exists');
        err.code = 'BOOKING_CONFLICT';
        err.conflicts = conflicts;
        throw err;
      }
      await connection.execute(
        `UPDATE game_bookings
         SET start_time = ?, end_time = ?, duration_minutes = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [startTime, endTime, durationMinutes, id]
      );
      await connection.commit();
      await connection.query('SELECT RELEASE_LOCK(?)', [lockName]);
      return this.getById(id);
    } catch (error) {
      try { await connection.rollback(); } catch (_) {}
      try { await connection.query('SELECT RELEASE_LOCK(?)', [lockName]); } catch (_) {}
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateStatus(id, status) {
    await db.execute(
      `UPDATE game_bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, id]
    );
    return this.getById(id);
  }

  static async getUpcomingAlerts(minutes = 20) {
    const [rows] = await db.execute(
      `SELECT b.id, b.device_id, d.name AS device_name, b.customer_name,
              b.booking_source, b.status, b.start_time, b.end_time,
              TIMESTAMPDIFF(MINUTE, NOW(), b.end_time) AS minutes_to_end,
              TIMESTAMPDIFF(MINUTE, NOW(), b.start_time) AS minutes_to_start
       FROM game_bookings b
       JOIN game_devices d ON d.id = b.device_id
       WHERE (
          (b.status = 'playing' AND b.end_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? MINUTE))
          OR
          (b.status IN ('held','confirmed') AND b.start_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? MINUTE))
       )
       ORDER BY COALESCE(
         CASE WHEN b.status = 'playing' THEN b.end_time ELSE b.start_time END,
         b.start_time
       )`,
      [minutes, minutes]
    );
    return rows;
  }

  static async getRate(rateId) {
    if (!rateId) return null;
    const [rows] = await db.execute('SELECT id, name, price FROM game_rates WHERE id = ? AND is_active = 1', [rateId]);
    return rows[0] || null;
  }

  static async getAdminList(filters) {
    const { page = 1, limit = 20, start_date, end_date, status, booking_source, search } = filters;
    const offset = (Number(page) - 1) * Number(limit);
    const params = [];
    
    let whereClause = '1=1';

    if (start_date) {
      whereClause += ' AND DATE(b.start_time) >= ?';
      params.push(start_date);
    }
    if (end_date) {
      whereClause += ' AND DATE(b.start_time) <= ?';
      params.push(end_date);
    }
    if (status) {
      whereClause += ' AND b.status = ?';
      params.push(status);
    }
    if (booking_source) {
      whereClause += ' AND b.booking_source = ?';
      params.push(booking_source);
    }
    if (search) {
      whereClause += ' AND (b.id LIKE ? OR b.customer_name LIKE ? OR b.customer_phone LIKE ?)';
      const searchStr = `%${search}%`;
      params.push(searchStr, searchStr, searchStr);
    }

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM game_bookings b 
      WHERE ${whereClause}
    `;
    const [countResult] = await db.execute(countQuery, params);
    const total = countResult[0].total;

    const query = `
      SELECT b.*, d.name AS device_name, g.name AS game_name
      FROM game_bookings b
      LEFT JOIN game_devices d ON b.device_id = d.id
      LEFT JOIN available_games g ON b.game_id = g.id
      WHERE ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;
    
    const [rows] = await db.execute(query, params);

    return {
      data: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  static async getAdminStats(filters) {
    const { start_date, end_date } = filters;
    const params = [];
    let whereClause = '1=1';

    if (start_date) {
      whereClause += ' AND DATE(start_time) >= ?';
      params.push(start_date);
    }
    if (end_date) {
      whereClause += ' AND DATE(start_time) <= ?';
      params.push(end_date);
    }

    const query = `SELECT status, total_price, due_amount FROM game_bookings WHERE ${whereClause}`;
    const [rows] = await db.execute(query, params);

    const stats = {
      total_bookings: rows.length,
      active_playing: rows.filter(r => r.status === 'playing').length,
      total_revenue: rows.reduce((sum, r) => sum + Number(r.total_price), 0),
      total_due: rows.reduce((sum, r) => sum + Number(r.due_amount), 0),
    };

    return stats;
  }

  static async receivePayment(id, amountToAdd, mode) {
    const booking = await this.getById(id);
    if (!booking) throw new Error("Booking not found");

    const newPaidAmount = Number(booking.paid_amount || 0) + Number(amountToAdd);
    const newDueAmount = Number(booking.total_price || 0) - newPaidAmount;
    
    const finalDue = newDueAmount < 0 ? 0 : newDueAmount;
    const paymentStatus = finalDue <= 0 ? 'paid' : 'partial';

    await db.execute(
      `UPDATE game_bookings 
       SET paid_amount = ?, due_amount = ?, payment_mode = ?, payment_status = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [newPaidAmount, finalDue, mode, paymentStatus, id]
    );

    return this.getById(id);
  }
}

GameBooking.ACTIVE_STATUSES = ACTIVE_STATUSES;
module.exports = GameBooking;