const express = require('express');
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const { normalizeDate, parseMoney, todayIso } = require('../utils/formatters');

const router = express.Router();

const BUSINESS_PROFILE = {
  hotel_name: 'ANVI GRAND',
  restaurant_name: 'CHIGURU',
  platform_name: 'ANVI GRAND Hospitality Platform',
  address: 'Near Benz Circle, Eluru Road, Vijayawada, Krishna Dist, Andhra Pradesh',
  phone: '7569494949',
  email: 'dpanvigrand@gmail.com',
  admin_phone: '7569494949',
  reception_phone: '7569494949',
  restaurant_phone: '7569494949'
};

const CONTENT_TYPES = new Set(['GALLERY', 'FOOD', 'ROOM', 'BANQUET']);
const BOOKING_TYPES = new Set(['ROOM', 'FOOD', 'BANQUET']);
const BOOKING_STATUS = new Set(['ENQUIRY', 'ADVANCE', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED']);
const TASK_AREAS = new Set(['RECEPTION', 'KITCHEN', 'MANAGER', 'SERVER', 'SUPPLIER', 'STORE', 'HOUSEKEEPING', 'LAUNDRY', 'DOBI', 'SECURITY', 'TAKEAWAY', 'ACCOUNTS']);
const TASK_STATUS = new Set(['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED']);
const STOCK_DIRECTIONS = new Set(['INWARD', 'OUTWARD']);
const ORDER_STATUS = new Set(['NEW', 'KITCHEN', 'READY', 'SERVED', 'DISPATCHED', 'DELIVERED', 'CANCELLED']);
const STAFF_ROLES = new Set(['MANAGER', 'RECEPTION', 'WAITER', 'SUPPLIER', 'KITCHEN', 'HOUSEKEEPING', 'DOBI', 'SECURITY', 'STORE', 'ACCOUNTS']);
const ATTENDANCE_STATUS = new Set(['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE']);

let schemaReadyPromise = null;

function cleanText(value, maxLength = 255) {
  return String(value || '').trim().slice(0, maxLength);
}

function cleanPhone(value) {
  return String(value || '').replace(/[^\d+]/g, '').slice(0, 20);
}

function contentType(value) {
  const normalized = String(value || '').toUpperCase();
  return CONTENT_TYPES.has(normalized) ? normalized : 'GALLERY';
}

function bookingType(value) {
  const normalized = String(value || '').toUpperCase();
  return BOOKING_TYPES.has(normalized) ? normalized : 'ROOM';
}

function bookingStatus(value) {
  const normalized = String(value || '').toUpperCase();
  return BOOKING_STATUS.has(normalized) ? normalized : 'ENQUIRY';
}

function taskArea(value) {
  const normalized = String(value || '').toUpperCase();
  return TASK_AREAS.has(normalized) ? normalized : 'RECEPTION';
}

function taskStatus(value) {
  const normalized = String(value || '').toUpperCase();
  return TASK_STATUS.has(normalized) ? normalized : 'OPEN';
}

function orderStatus(value) {
  const normalized = String(value || '').toUpperCase();
  return ORDER_STATUS.has(normalized) ? normalized : 'NEW';
}

function staffRole(value) {
  const normalized = String(value || '').toUpperCase();
  return STAFF_ROLES.has(normalized) ? normalized : 'WAITER';
}

function attendanceStatus(value) {
  const normalized = String(value || '').toUpperCase();
  return ATTENDANCE_STATUS.has(normalized) ? normalized : 'PRESENT';
}

async function addColumnIfMissing(tableName, columnName, definition) {
  try {
    await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  } catch (err) {
    if (err.code !== 'ER_DUP_FIELDNAME') throw err;
  }
}

async function loadProfile() {
  const [rows] = await db.query('SELECT setting_key, setting_value FROM hospitality_settings');
  return rows.reduce((profile, row) => {
    profile[row.setting_key] = row.setting_value || '';
    return profile;
  }, { ...BUSINESS_PROFILE });
}

async function ensureSchema() {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      await db.query(`
        CREATE TABLE IF NOT EXISTS hospitality_settings (
          setting_key VARCHAR(80) PRIMARY KEY,
          setting_value TEXT DEFAULT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      await db.query(`
        CREATE TABLE IF NOT EXISTS hospitality_content (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          content_type ENUM('GALLERY','FOOD','ROOM','BANQUET') NOT NULL,
          title VARCHAR(160) NOT NULL,
          description TEXT DEFAULT NULL,
          image_url TEXT DEFAULT NULL,
          price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          unit_label VARCHAR(80) DEFAULT '',
          capacity INT DEFAULT NULL,
          display_order INT NOT NULL DEFAULT 0,
          is_active TINYINT(1) NOT NULL DEFAULT 1,
          created_by VARCHAR(100) DEFAULT '',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_hospitality_content_type_active (content_type, is_active, display_order, id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      await db.query(`
        CREATE TABLE IF NOT EXISTS hospitality_bookings (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          booking_type ENUM('ROOM','FOOD','BANQUET') NOT NULL,
          booking_date DATE NOT NULL,
          end_date DATE DEFAULT NULL,
          time_slot VARCHAR(80) DEFAULT '',
          customer_name VARCHAR(160) NOT NULL,
          customer_phone VARCHAR(20) NOT NULL,
          customer_address VARCHAR(500) DEFAULT '',
          item_title VARCHAR(160) DEFAULT '',
          table_number VARCHAR(40) DEFAULT '',
          server_id VARCHAR(80) DEFAULT '',
          waiter_name VARCHAR(120) DEFAULT '',
          supplier_name VARCHAR(120) DEFAULT '',
          order_status ENUM('NEW','KITCHEN','READY','SERVED','DISPATCHED','DELIVERED','CANCELLED') NOT NULL DEFAULT 'NEW',
          delivery_status VARCHAR(120) DEFAULT '',
          dispatch_details VARCHAR(500) DEFAULT '',
          upi_qr_text VARCHAR(500) DEFAULT '',
          guest_count INT DEFAULT NULL,
          food_plan ENUM('WITH_FOOD','WITHOUT_FOOD') NOT NULL DEFAULT 'WITHOUT_FOOD',
          food_details VARCHAR(500) DEFAULT '',
          complimentary_breakfast VARCHAR(500) DEFAULT '',
          room_facilities VARCHAR(800) DEFAULT '',
          travel_notes VARCHAR(800) DEFAULT '',
          print_format ENUM('A4','THERMAL') NOT NULL DEFAULT 'A4',
          gst_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
          gst_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          advance_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          balance_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          payment_mode VARCHAR(40) DEFAULT 'Cash',
          status ENUM('ENQUIRY','ADVANCE','CONFIRMED','CHECKED_IN','COMPLETED','CANCELLED') NOT NULL DEFAULT 'ENQUIRY',
          notes TEXT DEFAULT NULL,
          created_by VARCHAR(100) DEFAULT '',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_hospitality_bookings_date_type (booking_date, booking_type),
          INDEX idx_hospitality_bookings_status (status, booking_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      await addColumnIfMissing('hospitality_bookings', 'end_date', 'DATE DEFAULT NULL AFTER booking_date');
      await addColumnIfMissing('hospitality_bookings', 'table_number', "VARCHAR(40) DEFAULT '' AFTER item_title");
      await addColumnIfMissing('hospitality_bookings', 'server_id', "VARCHAR(80) DEFAULT '' AFTER table_number");
      await addColumnIfMissing('hospitality_bookings', 'waiter_name', "VARCHAR(120) DEFAULT '' AFTER server_id");
      await addColumnIfMissing('hospitality_bookings', 'supplier_name', "VARCHAR(120) DEFAULT '' AFTER waiter_name");
      await addColumnIfMissing('hospitality_bookings', 'order_status', "ENUM('NEW','KITCHEN','READY','SERVED','DISPATCHED','DELIVERED','CANCELLED') NOT NULL DEFAULT 'NEW' AFTER supplier_name");
      await addColumnIfMissing('hospitality_bookings', 'delivery_status', "VARCHAR(120) DEFAULT '' AFTER order_status");
      await addColumnIfMissing('hospitality_bookings', 'dispatch_details', "VARCHAR(500) DEFAULT '' AFTER delivery_status");
      await addColumnIfMissing('hospitality_bookings', 'upi_qr_text', "VARCHAR(500) DEFAULT '' AFTER dispatch_details");
      await addColumnIfMissing('hospitality_bookings', 'food_plan', "ENUM('WITH_FOOD','WITHOUT_FOOD') NOT NULL DEFAULT 'WITHOUT_FOOD' AFTER guest_count");
      await addColumnIfMissing('hospitality_bookings', 'food_details', "VARCHAR(500) DEFAULT '' AFTER food_plan");
      await addColumnIfMissing('hospitality_bookings', 'complimentary_breakfast', "VARCHAR(500) DEFAULT '' AFTER food_details");
      await addColumnIfMissing('hospitality_bookings', 'room_facilities', "VARCHAR(800) DEFAULT '' AFTER complimentary_breakfast");
      await addColumnIfMissing('hospitality_bookings', 'travel_notes', "VARCHAR(800) DEFAULT '' AFTER room_facilities");
      await addColumnIfMissing('hospitality_bookings', 'print_format', "ENUM('A4','THERMAL') NOT NULL DEFAULT 'A4' AFTER travel_notes");
      await addColumnIfMissing('hospitality_bookings', 'gst_percent', 'DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER print_format');
      await addColumnIfMissing('hospitality_bookings', 'gst_amount', 'DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER gst_percent');
      await db.query(`
        CREATE TABLE IF NOT EXISTS hospitality_ops_tasks (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          task_date DATE NOT NULL,
          area ENUM('RECEPTION','KITCHEN','MANAGER','SERVER','SUPPLIER','STORE','HOUSEKEEPING','LAUNDRY','DOBI','SECURITY','TAKEAWAY','ACCOUNTS') NOT NULL,
          title VARCHAR(180) NOT NULL,
          assigned_to VARCHAR(120) DEFAULT '',
          amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          status ENUM('OPEN','IN_PROGRESS','DONE','CANCELLED') NOT NULL DEFAULT 'OPEN',
          notes TEXT DEFAULT NULL,
          created_by VARCHAR(100) DEFAULT '',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_hospitality_tasks_date_area (task_date, area),
          INDEX idx_hospitality_tasks_status (status, task_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      await db.query(`
        CREATE TABLE IF NOT EXISTS hospitality_stock_movements (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          movement_date DATE NOT NULL,
          direction ENUM('INWARD','OUTWARD') NOT NULL,
          item_name VARCHAR(180) NOT NULL,
          supplier_name VARCHAR(160) DEFAULT '',
          quantity DECIMAL(12,3) NOT NULL DEFAULT 0.000,
          unit_label VARCHAR(40) DEFAULT '',
          amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          purpose VARCHAR(180) DEFAULT '',
          notes TEXT DEFAULT NULL,
          created_by VARCHAR(100) DEFAULT '',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_hospitality_stock_date_direction (movement_date, direction)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      await db.query(`
        CREATE TABLE IF NOT EXISTS hospitality_staff (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          staff_name VARCHAR(160) NOT NULL,
          role ENUM('MANAGER','RECEPTION','WAITER','SUPPLIER','KITCHEN','HOUSEKEEPING','DOBI','SECURITY','STORE','ACCOUNTS') NOT NULL DEFAULT 'WAITER',
          phone VARCHAR(20) DEFAULT '',
          address VARCHAR(500) DEFAULT '',
          shift_label VARCHAR(80) DEFAULT '',
          is_active TINYINT(1) NOT NULL DEFAULT 1,
          created_by VARCHAR(100) DEFAULT '',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_hospitality_staff_role_active (role, is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      await db.query(`
        CREATE TABLE IF NOT EXISTS hospitality_staff_attendance (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          staff_id BIGINT DEFAULT NULL,
          attendance_date DATE NOT NULL,
          staff_name VARCHAR(160) NOT NULL,
          role ENUM('MANAGER','RECEPTION','WAITER','SUPPLIER','KITCHEN','HOUSEKEEPING','DOBI','SECURITY','STORE','ACCOUNTS') NOT NULL DEFAULT 'WAITER',
          status ENUM('PRESENT','ABSENT','HALF_DAY','LEAVE') NOT NULL DEFAULT 'PRESENT',
          check_in VARCHAR(20) DEFAULT '',
          check_out VARCHAR(20) DEFAULT '',
          notes VARCHAR(500) DEFAULT '',
          created_by VARCHAR(100) DEFAULT '',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_hospitality_attendance_date_role (attendance_date, role)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      await db.query(`
        CREATE TABLE IF NOT EXISTS hospitality_walkins (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          visit_date DATE NOT NULL,
          customer_name VARCHAR(160) NOT NULL,
          customer_phone VARCHAR(20) NOT NULL,
          purpose VARCHAR(120) DEFAULT '',
          notes VARCHAR(500) DEFAULT '',
          created_by VARCHAR(100) DEFAULT '',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_hospitality_walkins_phone_date (customer_phone, visit_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      await db.query(`
        ALTER TABLE hospitality_ops_tasks
        MODIFY COLUMN area ENUM('RECEPTION','KITCHEN','MANAGER','SERVER','SUPPLIER','STORE','HOUSEKEEPING','LAUNDRY','DOBI','SECURITY','TAKEAWAY','ACCOUNTS') NOT NULL
      `);

      await db.query(
        `INSERT IGNORE INTO hospitality_settings (setting_key, setting_value)
         VALUES ?`,
        [Object.entries(BUSINESS_PROFILE)]
      );

      const [[existing]] = await db.query('SELECT COUNT(*) AS count FROM hospitality_content');
      if (Number(existing.count || 0) === 0) {
        await db.query(
          `INSERT INTO hospitality_content
           (content_type, title, description, image_url, price, unit_label, capacity, display_order, created_by)
           VALUES ?`,
          [[
            ['GALLERY', 'ANVI GRAND Front View', 'Hotel, restaurant and banquet experience near Benz Circle.', '', 0, '', null, 1, 'system'],
            ['FOOD', 'CHIGURU Veg Meals', 'Fresh Andhra meals for dine-in and online food orders.', '', 180, 'plate', null, 1, 'system'],
            ['FOOD', 'CHIGURU Special Biryani', 'Signature restaurant item for quick menu setup.', '', 260, 'plate', null, 2, 'system'],
            ['ROOM', 'Deluxe Room', 'Comfortable room for family and business guests.', '', 2500, 'night', 2, 1, 'system'],
            ['BANQUET', 'Banquet Hall', 'Event hall for functions, meetings and celebrations.', '', 25000, 'event', 250, 1, 'system'],
            ['BANQUET', 'Mini Hall', 'Compact hall for birthdays and small family events.', '', 12000, 'event', 80, 2, 'system']
          ]]
        );
      }
    })();
  }
  return schemaReadyPromise;
}

router.use(async (_req, _res, next) => {
  try {
    await ensureSchema();
    next();
  } catch (err) {
    next(err);
  }
});

router.get('/public', async (_req, res) => {
  res.status(410).json({
    error: 'ANVI GRAND public website is disabled. Please use the operations app login.'
  });
});

async function saveBookingRecord(req, res, createdBy = '') {
  const id = Number.parseInt(req.body?.id, 10) || null;
  const customerName = cleanText(req.body?.customer_name, 160);
  const customerPhone = cleanPhone(req.body?.customer_phone);
  if (!customerName || !customerPhone) return res.status(400).json({ error: 'Customer name and phone are required.' });

  const total = parseMoney(req.body?.total_amount);
  const advance = parseMoney(req.body?.advance_amount);
  const gstPercent = parseMoney(req.body?.gst_percent);
  const requestedGstAmount = parseMoney(req.body?.gst_amount);
  const gstAmount = requestedGstAmount || (gstPercent > 0 && total > 0 ? Number((total * gstPercent / (100 + gstPercent)).toFixed(2)) : 0);
  const startDate = normalizeDate(req.body?.booking_date, todayIso());
  const requestedEndDate = normalizeDate(req.body?.end_date, startDate);
  const bookingStartDate = startDate <= requestedEndDate ? startDate : requestedEndDate;
  const bookingEndDate = startDate <= requestedEndDate ? requestedEndDate : startDate;
  const foodPlan = String(req.body?.food_plan || '').toUpperCase() === 'WITH_FOOD' ? 'WITH_FOOD' : 'WITHOUT_FOOD';
  const payload = [
    bookingType(req.body?.booking_type),
    bookingStartDate,
    bookingEndDate,
    cleanText(req.body?.time_slot, 80),
    customerName,
    customerPhone,
    cleanText(req.body?.customer_address, 500),
    cleanText(req.body?.item_title, 160),
    cleanText(req.body?.table_number, 40),
    cleanText(req.body?.server_id, 80),
    cleanText(req.body?.waiter_name, 120),
    cleanText(req.body?.supplier_name, 120),
    orderStatus(req.body?.order_status),
    cleanText(req.body?.delivery_status, 120),
    cleanText(req.body?.dispatch_details, 500),
    cleanText(req.body?.upi_qr_text, 500),
    Number.parseInt(req.body?.guest_count, 10) || null,
    foodPlan,
    cleanText(req.body?.food_details, 500),
    cleanText(req.body?.complimentary_breakfast, 500),
    cleanText(req.body?.room_facilities, 800),
    cleanText(req.body?.travel_notes, 800),
    String(req.body?.print_format || '').toUpperCase() === 'THERMAL' ? 'THERMAL' : 'A4',
    gstPercent,
    gstAmount,
    total,
    advance,
    Math.max(total - advance, 0),
    cleanText(req.body?.payment_mode, 40) || 'Cash',
    bookingStatus(req.body?.status),
    cleanText(req.body?.notes, 2000)
  ];

  if (id) {
    await db.query(
      `UPDATE hospitality_bookings
       SET booking_type = ?, booking_date = ?, end_date = ?, time_slot = ?, customer_name = ?, customer_phone = ?,
           customer_address = ?, item_title = ?, table_number = ?, server_id = ?, waiter_name = ?, supplier_name = ?,
           order_status = ?, delivery_status = ?, dispatch_details = ?, upi_qr_text = ?, guest_count = ?, food_plan = ?, food_details = ?,
           complimentary_breakfast = ?, room_facilities = ?, travel_notes = ?, print_format = ?, gst_percent = ?, gst_amount = ?, total_amount = ?, advance_amount = ?,
           balance_amount = ?, payment_mode = ?, status = ?, notes = ?
       WHERE id = ?`,
      [...payload, id]
    );
    return res.json({ success: true, id });
  }

  const [result] = await db.query(
    `INSERT INTO hospitality_bookings
     (booking_type, booking_date, end_date, time_slot, customer_name, customer_phone, customer_address, item_title,
      table_number, server_id, waiter_name, supplier_name, order_status, delivery_status, dispatch_details, upi_qr_text,
      guest_count, food_plan, food_details, complimentary_breakfast, room_facilities, travel_notes,
      print_format, gst_percent, gst_amount, total_amount, advance_amount, balance_amount,
      payment_mode, status, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [...payload, createdBy]
  );
  res.json({ success: true, id: result.insertId });
}

router.post('/public/bookings', async (_req, res) => {
  res.status(410).json({
    error: 'ANVI GRAND public website booking is disabled. Please use the operations app login.'
  });
});

router.use(authenticate, authorize('SERVER', 'ADMIN'));

router.get('/summary', async (_req, res) => {
  const [[bookings]] = await db.query(
    `SELECT
       COUNT(*) AS total_bookings,
       SUM(CASE WHEN booking_date <= CURDATE() AND COALESCE(end_date, booking_date) >= CURDATE() THEN 1 ELSE 0 END) AS today_bookings,
       COALESCE(SUM(advance_amount), 0) AS advance_total,
       COALESCE(SUM(balance_amount), 0) AS balance_total
     FROM hospitality_bookings
     WHERE status <> 'CANCELLED'`
  );
  const [[tasks]] = await db.query(
    `SELECT
       SUM(CASE WHEN status IN ('OPEN','IN_PROGRESS') THEN 1 ELSE 0 END) AS pending_tasks,
       SUM(CASE WHEN task_date = CURDATE() AND status <> 'CANCELLED' THEN 1 ELSE 0 END) AS today_tasks
     FROM hospitality_ops_tasks`
  );
  const [[stock]] = await db.query(
    `SELECT
       COALESCE(SUM(CASE WHEN direction = 'INWARD' THEN amount ELSE 0 END), 0) AS inward_amount,
       COALESCE(SUM(CASE WHEN direction = 'OUTWARD' THEN amount ELSE 0 END), 0) AS outward_amount
     FROM hospitality_stock_movements
     WHERE movement_date = CURDATE()`
  );
  res.json({ profile: await loadProfile(), bookings, tasks, stock });
});

router.get('/profile', async (_req, res) => {
  res.json({ profile: await loadProfile() });
});

router.post('/profile', async (req, res) => {
  const allowed = ['hotel_name', 'restaurant_name', 'platform_name', 'address', 'phone', 'email', 'admin_phone', 'reception_phone', 'restaurant_phone'];
  const values = allowed.map((key) => [
    key,
    key.includes('phone') ? cleanPhone(req.body?.[key]) : cleanText(req.body?.[key], key === 'address' ? 500 : 180)
  ]);
  await db.query(
    `INSERT INTO hospitality_settings (setting_key, setting_value)
     VALUES ?
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [values]
  );
  res.json({ success: true, profile: await loadProfile() });
});

router.get('/content', async (req, res) => {
  const type = contentType(req.query.type || 'GALLERY');
  const [rows] = await db.query(
    `SELECT id, content_type, title, description, image_url, price, unit_label, capacity, display_order, is_active
     FROM hospitality_content
     WHERE content_type = ?
     ORDER BY is_active DESC, display_order, id DESC
     LIMIT 500`,
    [type]
  );
  res.json({ rows });
});

router.post('/content', async (req, res) => {
  const id = Number.parseInt(req.body?.id, 10) || null;
  const title = cleanText(req.body?.title, 160);
  if (!title) return res.status(400).json({ error: 'Title is required.' });

  const payload = [
    contentType(req.body?.content_type),
    title,
    cleanText(req.body?.description, 2000),
    cleanText(req.body?.image_url, 3000),
    parseMoney(req.body?.price),
    cleanText(req.body?.unit_label, 80),
    Number.parseInt(req.body?.capacity, 10) || null,
    Number.parseInt(req.body?.display_order, 10) || 0,
    req.body?.is_active === false || req.body?.is_active === 0 || req.body?.is_active === '0' ? 0 : 1
  ];

  if (id) {
    await db.query(
      `UPDATE hospitality_content
       SET content_type = ?, title = ?, description = ?, image_url = ?, price = ?, unit_label = ?,
           capacity = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [...payload, id]
    );
    return res.json({ success: true, id });
  }

  const [result] = await db.query(
    `INSERT INTO hospitality_content
     (content_type, title, description, image_url, price, unit_label, capacity, display_order, is_active, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [...payload, req.user.username]
  );
  res.json({ success: true, id: result.insertId });
});

router.delete('/content/:id', async (req, res) => {
  await db.query('DELETE FROM hospitality_content WHERE id = ?', [Number.parseInt(req.params.id, 10) || 0]);
  res.json({ success: true });
});

router.get('/bookings', async (req, res) => {
  const from = normalizeDate(req.query.from, todayIso());
  const to = normalizeDate(req.query.to, from);
  const type = String(req.query.type || 'ALL').toUpperCase();
  const rangeStart = from <= to ? from : to;
  const rangeEnd = from <= to ? to : from;
  const params = [rangeEnd, rangeStart];
  const where = ['booking_date <= ? AND COALESCE(end_date, booking_date) >= ?'];
  if (BOOKING_TYPES.has(type)) {
    where.push('booking_type = ?');
    params.push(type);
  }
  const [rows] = await db.query(
    `SELECT id, booking_type, DATE_FORMAT(booking_date, '%Y-%m-%d') AS booking_date,
            DATE_FORMAT(COALESCE(end_date, booking_date), '%Y-%m-%d') AS end_date, time_slot,
            customer_name, customer_phone, customer_address, item_title, guest_count, total_amount,
            table_number, server_id, waiter_name, supplier_name, order_status, delivery_status, dispatch_details, upi_qr_text,
            food_plan, food_details, complimentary_breakfast, room_facilities, travel_notes,
            print_format, gst_percent, gst_amount, advance_amount, balance_amount, payment_mode, status, notes
     FROM hospitality_bookings
     WHERE ${where.join(' AND ')}
     ORDER BY booking_date DESC, id DESC
     LIMIT 500`,
    params
  );
  res.json({ rows });
});

router.post('/bookings', async (req, res) => saveBookingRecord(req, res, req.user.username));

router.get('/tasks', async (req, res) => {
  const from = normalizeDate(req.query.from, todayIso());
  const to = normalizeDate(req.query.to, from);
  const [rows] = await db.query(
    `SELECT id, DATE_FORMAT(task_date, '%Y-%m-%d') AS task_date, area, title, assigned_to, amount, status, notes
     FROM hospitality_ops_tasks
     WHERE task_date BETWEEN ? AND ?
     ORDER BY task_date DESC, status, id DESC
     LIMIT 500`,
    [from <= to ? from : to, from <= to ? to : from]
  );
  res.json({ rows });
});

router.post('/tasks', async (req, res) => {
  const title = cleanText(req.body?.title, 180);
  if (!title) return res.status(400).json({ error: 'Task title is required.' });
  const id = Number.parseInt(req.body?.id, 10) || null;
  const payload = [
    normalizeDate(req.body?.task_date, todayIso()),
    taskArea(req.body?.area),
    title,
    cleanText(req.body?.assigned_to, 120),
    parseMoney(req.body?.amount),
    taskStatus(req.body?.status),
    cleanText(req.body?.notes, 2000)
  ];
  if (id) {
    await db.query(
      `UPDATE hospitality_ops_tasks
       SET task_date = ?, area = ?, title = ?, assigned_to = ?, amount = ?, status = ?, notes = ?
       WHERE id = ?`,
      [...payload, id]
    );
    return res.json({ success: true, id });
  }
  const [result] = await db.query(
    `INSERT INTO hospitality_ops_tasks
     (task_date, area, title, assigned_to, amount, status, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [...payload, req.user.username]
  );
  res.json({ success: true, id: result.insertId });
});

router.get('/stock-movements', async (req, res) => {
  const from = normalizeDate(req.query.from, todayIso());
  const to = normalizeDate(req.query.to, from);
  const [rows] = await db.query(
    `SELECT id, DATE_FORMAT(movement_date, '%Y-%m-%d') AS movement_date, direction, item_name,
            supplier_name, quantity, unit_label, amount, purpose, notes
     FROM hospitality_stock_movements
     WHERE movement_date BETWEEN ? AND ?
     ORDER BY movement_date DESC, id DESC
     LIMIT 500`,
    [from <= to ? from : to, from <= to ? to : from]
  );
  res.json({ rows });
});

router.post('/stock-movements', async (req, res) => {
  const itemName = cleanText(req.body?.item_name, 180);
  if (!itemName) return res.status(400).json({ error: 'Item name is required.' });
  const id = Number.parseInt(req.body?.id, 10) || null;
  const direction = STOCK_DIRECTIONS.has(String(req.body?.direction || '').toUpperCase())
    ? String(req.body.direction).toUpperCase()
    : 'INWARD';
  const payload = [
    normalizeDate(req.body?.movement_date, todayIso()),
    direction,
    itemName,
    cleanText(req.body?.supplier_name, 160),
    parseMoney(req.body?.quantity),
    cleanText(req.body?.unit_label, 40),
    parseMoney(req.body?.amount),
    cleanText(req.body?.purpose, 180),
    cleanText(req.body?.notes, 2000)
  ];
  if (id) {
    await db.query(
      `UPDATE hospitality_stock_movements
       SET movement_date = ?, direction = ?, item_name = ?, supplier_name = ?, quantity = ?,
           unit_label = ?, amount = ?, purpose = ?, notes = ?
       WHERE id = ?`,
      [...payload, id]
    );
    return res.json({ success: true, id });
  }
  const [result] = await db.query(
    `INSERT INTO hospitality_stock_movements
     (movement_date, direction, item_name, supplier_name, quantity, unit_label, amount, purpose, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [...payload, req.user.username]
  );
  res.json({ success: true, id: result.insertId });
});

router.get('/staff', async (req, res) => {
  const role = String(req.query.role || 'ALL').toUpperCase();
  const where = [];
  const params = [];
  if (STAFF_ROLES.has(role)) {
    where.push('role = ?');
    params.push(role);
  }
  const [rows] = await db.query(
    `SELECT id, staff_name, role, phone, address, shift_label, is_active
     FROM hospitality_staff
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY is_active DESC, role, staff_name
     LIMIT 500`,
    params
  );
  res.json({ rows });
});

router.post('/staff', async (req, res) => {
  const id = Number.parseInt(req.body?.id, 10) || null;
  const staffName = cleanText(req.body?.staff_name, 160);
  if (!staffName) return res.status(400).json({ error: 'Staff name is required.' });
  const payload = [
    staffName,
    staffRole(req.body?.role),
    cleanPhone(req.body?.phone),
    cleanText(req.body?.address, 500),
    cleanText(req.body?.shift_label, 80),
    req.body?.is_active === false || req.body?.is_active === 0 || req.body?.is_active === '0' ? 0 : 1
  ];
  if (id) {
    await db.query(
      `UPDATE hospitality_staff
       SET staff_name = ?, role = ?, phone = ?, address = ?, shift_label = ?, is_active = ?
       WHERE id = ?`,
      [...payload, id]
    );
    return res.json({ success: true, id });
  }
  const [result] = await db.query(
    `INSERT INTO hospitality_staff
     (staff_name, role, phone, address, shift_label, is_active, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [...payload, req.user.username]
  );
  res.json({ success: true, id: result.insertId });
});

router.get('/attendance', async (req, res) => {
  const from = normalizeDate(req.query.from, todayIso());
  const to = normalizeDate(req.query.to, from);
  const [rows] = await db.query(
    `SELECT id, staff_id, DATE_FORMAT(attendance_date, '%Y-%m-%d') AS attendance_date,
            staff_name, role, status, check_in, check_out, notes
     FROM hospitality_staff_attendance
     WHERE attendance_date BETWEEN ? AND ?
     ORDER BY attendance_date DESC, role, staff_name
     LIMIT 500`,
    [from <= to ? from : to, from <= to ? to : from]
  );
  res.json({ rows });
});

router.post('/attendance', async (req, res) => {
  const staffName = cleanText(req.body?.staff_name, 160);
  if (!staffName) return res.status(400).json({ error: 'Staff name is required.' });
  const [result] = await db.query(
    `INSERT INTO hospitality_staff_attendance
     (staff_id, attendance_date, staff_name, role, status, check_in, check_out, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      Number.parseInt(req.body?.staff_id, 10) || null,
      normalizeDate(req.body?.attendance_date, todayIso()),
      staffName,
      staffRole(req.body?.role),
      attendanceStatus(req.body?.status),
      cleanText(req.body?.check_in, 20),
      cleanText(req.body?.check_out, 20),
      cleanText(req.body?.notes, 500),
      req.user.username
    ]
  );
  res.json({ success: true, id: result.insertId });
});

router.get('/walkins', async (req, res) => {
  const from = normalizeDate(req.query.from, todayIso());
  const to = normalizeDate(req.query.to, from);
  const [rows] = await db.query(
    `SELECT w.id, DATE_FORMAT(w.visit_date, '%Y-%m-%d') AS visit_date, w.customer_name, w.customer_phone,
            w.purpose, w.notes,
            (SELECT COUNT(*) FROM hospitality_walkins x WHERE x.customer_phone = w.customer_phone) AS visit_count
     FROM hospitality_walkins w
     WHERE w.visit_date BETWEEN ? AND ?
     ORDER BY w.visit_date DESC, w.id DESC
     LIMIT 500`,
    [from <= to ? from : to, from <= to ? to : from]
  );
  res.json({ rows });
});

router.post('/walkins', async (req, res) => {
  const customerName = cleanText(req.body?.customer_name, 160);
  const customerPhone = cleanPhone(req.body?.customer_phone);
  if (!customerName || !customerPhone) return res.status(400).json({ error: 'Customer name and phone are required.' });
  const [result] = await db.query(
    `INSERT INTO hospitality_walkins
     (visit_date, customer_name, customer_phone, purpose, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      normalizeDate(req.body?.visit_date, todayIso()),
      customerName,
      customerPhone,
      cleanText(req.body?.purpose, 120),
      cleanText(req.body?.notes, 500),
      req.user.username
    ]
  );
  res.json({ success: true, id: result.insertId });
});

module.exports = router;
