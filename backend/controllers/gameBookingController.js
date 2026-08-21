const GameBooking = require('../models/GameBooking');

const VALID_STATUSES = ['held', 'confirmed', 'playing', 'completed', 'cancelled', 'no_show'];

function parseDateTime(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toMysqlDateTime(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + Number(minutes) * 60000);
}

function overlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Normalize platform parameter.
 * If platform is 'all' or empty, return null (skip filtering).
 * Otherwise return the trimmed string.
 */
function normalizePlatform(platform) {
  if (!platform) return null;
  const p = String(platform).trim();
  if (p.toLowerCase() === 'all') return null;
  return p;
}

async function calculateTotal(rateId, durationMinutes, overrideTotal) {
  if (overrideTotal !== undefined && overrideTotal !== null && overrideTotal !== '') {
    return Number(overrideTotal) || 0;
  }
  const rate = await GameBooking.getRate(rateId);
  if (!rate) return 0;
  return Number((Number(rate.price) * (Number(durationMinutes) / 60)).toFixed(2));
}

exports.getAvailability = async (req, res) => {
  try {
    // Default platform to 'all' so we return ALL active devices
    const { date, platform = 'all' } = req.query;
    const durationMinutes = Math.max(15, Number(req.query.duration_minutes || 60));
    const slotInterval = Math.max(10, Number(req.query.slot_interval || 30));
    const openTime = req.query.open_time || '10:00';
    const closeTime = req.query.close_time || '23:00';

    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) {
      return res.status(400).json({ success: false, message: 'date must be YYYY-MM-DD' });
    }

    const devices = await GameBooking.getActiveDevices(normalizePlatform(platform));
    const bookings = await GameBooking.getTimeline(date);

    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
    const startOfDay = new Date(`${date}T00:00:00`);
    const windowStart = new Date(startOfDay);
    windowStart.setHours(openHour, openMinute, 0, 0);
    const windowEnd = new Date(startOfDay);
    windowEnd.setHours(closeHour, closeMinute, 0, 0);

    const slots = [];
    for (let start = new Date(windowStart); addMinutes(start, durationMinutes) <= windowEnd; start = addMinutes(start, slotInterval)) {
      const end = addMinutes(start, durationMinutes);
      const freeDeviceIds = devices
        .filter((device) => {
          const conflicts = bookings.some((b) =>
            Number(b.device_id) === Number(device.id) &&
            GameBooking.ACTIVE_STATUSES.includes(b.status) &&
            overlap(start, end, new Date(b.start_time), new Date(b.end_time))
          );
          return !conflicts;
        })
        .map((d) => d.id);

      slots.push({
        start_time: toMysqlDateTime(start),
        end_time: toMysqlDateTime(end),
        available_count: freeDeviceIds.length,
        available: freeDeviceIds.length > 0,
        available_device_ids: freeDeviceIds
      });
    }

    res.json({
      success: true,
      date,
      platform,
      duration_minutes: durationMinutes,
      total_devices: devices.length,
      slots
    });
  } catch (error) {
    console.error('Game availability error:', error);
    res.status(500).json({ success: false, message: 'Unable to load availability' });
  }
};

// -------------------------------------------------------------------
// The rest of the controller remains unchanged.
// (autoAssignDevice, createOnlineBooking, getAdminTimeline,
//  createWalkInBooking, extendBooking, updateBookingStatus,
//  getAlerts, getAdminBookingsList, getAdminBookingsStats, receivePayment)
// -------------------------------------------------------------------

async function autoAssignDevice({ platform, startTime, endTime, preferredDeviceId }) {
  const devices = await GameBooking.getActiveDevices(normalizePlatform(platform));
  if (preferredDeviceId) {
    const prefDevice = devices.find(d => d.id === preferredDeviceId);
    if (prefDevice) {
      const conflicts = await GameBooking.findOverlaps(prefDevice.id, startTime, endTime);
      if (!conflicts.length) return prefDevice;
    }
  }
  for (const device of devices) {
    const conflicts = await GameBooking.findOverlaps(device.id, startTime, endTime);
    if (!conflicts.length) return device;
  }
  return null;
}

exports.createOnlineBooking = async (req, res) => {
  try {
    const {
      platform = 'PS5', game_id, rate_id, preferred_device_id,
      salesperson_id, salesperson_name, customer_id, customer_name, customer_phone,
      start_time, duration_minutes = 60, 
      subtotal = 0, discount_percent = 0, discount_amount = 0, tax_amount = 0, round_off = 0, 
      total_price, paid_amount = 0, due_amount = 0, 
      addons_data, payment_mode, payment_status = 'pending', notes
    } = req.body;

    const start = parseDateTime(start_time);
    const durationMinutes = Number(duration_minutes);
    if (!start || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      return res.status(400).json({ success: false, message: 'Valid start_time and duration_minutes are required' });
    }
    const end = addMinutes(start, durationMinutes);
    const startMysql = toMysqlDateTime(start);
    const endMysql = toMysqlDateTime(end);

    const device = await autoAssignDevice({ platform, startTime: startMysql, endTime: endMysql, preferredDeviceId: preferred_device_id });
    if (!device) {
      return res.status(409).json({ success: false, code: 'SLOT_SOLD_OUT', message: 'No device is available for the selected time' });
    }

    const price = await calculateTotal(rate_id, durationMinutes, total_price);
    
    const initialStatus = (payment_mode === 'online' && payment_status === 'pending') ? 'pending' : 'confirmed';

    const booking = await GameBooking.createSerialized({
      device_id: device.id,
      game_id,
      rate_id,
      game_user_id: req.user?.id || null,
      customer_id,
      customer_name: customer_name || req.user?.name || 'Online Customer',
      customer_phone,
      salesperson_id,
      salesperson_name,
      booking_source: 'online',
      status: initialStatus,
      start_time: startMysql,
      end_time: endMysql,
      duration_minutes: durationMinutes,
      subtotal,
      discount_percent,
      discount_amount,
      tax_amount,
      round_off,
      total_price: price,
      paid_amount,
      due_amount: due_amount || price,
      payment_mode,
      payment_status,
      addons_data,
      notes
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    if (error.code === 'BOOKING_CONFLICT') {
      return res.status(409).json({ success: false, code: error.code, message: error.message });
    }
    console.error('Create online booking error:', error);
    res.status(500).json({ success: false, message: 'Unable to create booking' });
  }
};

exports.getAdminTimeline = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const [devices, bookings] = await Promise.all([
      GameBooking.getActiveDevices(req.query.platform || null),
      GameBooking.getTimeline(date)
    ]);
    res.json({ success: true, date, devices, bookings });
  } catch (error) {
    console.error('Get admin timeline error:', error);
    res.status(500).json({ success: false, message: 'Unable to load timeline' });
  }
};

exports.createWalkInBooking = async (req, res) => {
  try {
    const {
      device_id, game_id, rate_id, salesperson_id, salesperson_name, 
      customer_id, customer_name = 'Walk-in Customer', customer_phone,
      start_time, duration_minutes = 60, 
      subtotal = 0, discount_percent = 0, discount_amount = 0, tax_amount = 0, round_off = 0, 
      total_price, paid_amount = 0, due_amount = 0, 
      addons_data, payment_mode, payment_status = 'pending', notes
    } = req.body;

    if (!device_id) return res.status(400).json({ success: false, message: 'device_id is required' });

    const start = start_time ? parseDateTime(start_time) : new Date();
    const durationMinutes = Number(duration_minutes);
    if (!start || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      return res.status(400).json({ success: false, message: 'Valid start_time and duration_minutes are required' });
    }

    const end = addMinutes(start, durationMinutes);
    const price = await calculateTotal(rate_id, durationMinutes, total_price);
    
    const booking = await GameBooking.createSerialized({
      device_id,
      game_id,
      rate_id,
      customer_id,
      customer_name,
      customer_phone,
      salesperson_id,
      salesperson_name,
      booking_source: 'walk_in',
      status: start <= new Date() ? 'playing' : 'confirmed',
      start_time: toMysqlDateTime(start),
      end_time: toMysqlDateTime(end),
      duration_minutes: durationMinutes,
      subtotal,
      discount_percent,
      discount_amount,
      tax_amount,
      round_off,
      total_price: price,
      paid_amount,
      due_amount,
      payment_mode,
      payment_status,
      addons_data,
      notes,
      created_by_admin_id: req.user?.id || req.admin?.id || null
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    if (error.code === 'BOOKING_CONFLICT') {
      const next = error.conflicts?.[0];
      return res.status(409).json({
        success: false,
        code: error.code,
        message: error.message,
        conflict: next ? { id: next.id, start_time: next.start_time, end_time: next.end_time } : null
      });
    }
    console.error('Create walk-in booking error:', error);
    res.status(500).json({ success: false, message: 'Unable to start walk-in session' });
  }
};

exports.extendBooking = async (req, res) => {
  try {
    const booking = await GameBooking.getById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const extraMinutes = Number(req.body.extra_minutes || 30);
    if (!Number.isFinite(extraMinutes) || extraMinutes <= 0) {
      return res.status(400).json({ success: false, message: 'extra_minutes must be greater than 0' });
    }

    const start = new Date(booking.start_time);
    const newEnd = addMinutes(new Date(booking.end_time), extraMinutes);
    const newDuration = Number(booking.duration_minutes) + extraMinutes;
    const updated = await GameBooking.updateTimesSerialized(
      booking.id,
      toMysqlDateTime(start),
      toMysqlDateTime(newEnd),
      newDuration
    );
    res.json({ success: true, booking: updated });
  } catch (error) {
    if (error.code === 'BOOKING_CONFLICT') {
      const next = error.conflicts?.[0];
      return res.status(409).json({
        success: false,
        code: error.code,
        message: error.message,
        next_booking: next ? { id: next.id, start_time: next.start_time, end_time: next.end_time } : null
      });
    }
    console.error('Extend booking error:', error);
    res.status(500).json({ success: false, message: 'Unable to extend booking' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }
    const existing = await GameBooking.getById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Booking not found' });
    const booking = await GameBooking.updateStatus(req.params.id, status);
    res.json({ success: true, booking });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ success: false, message: 'Unable to update booking status' });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const minutes = Math.min(120, Math.max(5, Number(req.query.minutes || 20)));
    const alerts = await GameBooking.getUpcomingAlerts(minutes);
    res.json({ success: true, alerts });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ success: false, message: 'Unable to load alerts' });
  }
};

exports.getAdminBookingsList = async (req, res) => {
  try {
    const filters = {
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      status: req.query.status,
      booking_source: req.query.booking_source,
      search: req.query.search
    };

    const result = await GameBooking.getAdminList(filters);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Get admin bookings list error:', error);
    res.status(500).json({ success: false, message: 'Unable to load bookings' });
  }
};

exports.getAdminBookingsStats = async (req, res) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    const stats = await GameBooking.getAdminStats(filters);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get admin bookings stats error:', error);
    res.status(500).json({ success: false, message: 'Unable to load stats' });
  }
};

exports.receivePayment = async (req, res) => {
  try {
    const { amount, payment_mode } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount is required and must be greater than zero.' });
    }
    
    const booking = await GameBooking.receivePayment(req.params.id, amount, payment_mode);
    res.json({ success: true, booking });
  } catch (error) {
    console.error('Receive payment error:', error);
    res.status(500).json({ success: false, message: error.message || 'Unable to receive payment' });
  }
};