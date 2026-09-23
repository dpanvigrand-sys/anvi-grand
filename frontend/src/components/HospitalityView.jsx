import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  deleteHospitalityContent,
  fetchHospitalityAttendance,
  fetchHospitalityBookings,
  fetchHospitalityContent,
  fetchHospitalityProfile,
  fetchHospitalityStaff,
  fetchHospitalityStockMovements,
  fetchHospitalitySummary,
  fetchHospitalityTasks,
  fetchHospitalityWalkins,
  saveHospitalityAttendance,
  saveHospitalityBooking,
  saveHospitalityContent,
  saveHospitalityProfile,
  saveHospitalityStaff,
  saveHospitalityStockMovement,
  saveHospitalityTask,
  saveHospitalityWalkin
} from '../api/client';

const localIso = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};
const today = () => localIso(new Date());
const toDate = (value) => new Date(`${value || today()}T00:00:00`);
const toIso = (date) => localIso(date);
const addDays = (value, days) => {
  const date = toDate(value);
  date.setDate(date.getDate() + days);
  return toIso(date);
};
const monthStart = (value) => {
  const date = toDate(value);
  return toIso(new Date(date.getFullYear(), date.getMonth(), 1));
};
const monthEnd = (value) => {
  const date = toDate(value);
  return toIso(new Date(date.getFullYear(), date.getMonth() + 1, 0));
};

const bookingTypes = ['ALL', 'ROOM', 'BANQUET', 'FOOD'];
const bookingStatuses = ['ENQUIRY', 'ADVANCE', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'];
const orderStatuses = ['NEW', 'KITCHEN', 'READY', 'SERVED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];
const taskAreas = ['RECEPTION', 'KITCHEN', 'MANAGER', 'SERVER', 'SUPPLIER', 'STORE', 'HOUSEKEEPING', 'LAUNDRY', 'DOBI', 'SECURITY', 'TAKEAWAY', 'ACCOUNTS'];
const taskStatuses = ['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED'];
const staffRoles = ['MANAGER', 'RECEPTION', 'WAITER', 'SUPPLIER', 'KITCHEN', 'HOUSEKEEPING', 'DOBI', 'SECURITY', 'STORE', 'ACCOUNTS'];
const attendanceStatuses = ['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE'];
const masterTabs = [['ROOM', 'Rooms'], ['BANQUET', 'Banquet Halls'], ['FOOD', 'Restaurant Menu']];
const systemPlan = [
  ['Reception', '2 computers', 'Windows 11 Pro, Chrome/Edge, UPS required', 'A4 laser/inkjet + 80mm thermal', 'Room booking, check-in slip, check-out final bill, advance receipts and guest ID handling.'],
  ['Restaurant Billing Counter', '1 touch computer', 'Windows 11 Pro touch PC, Chrome/Edge, USB/LAN printer drivers', '80mm thermal bill printer', 'Table bill, parcel bill, payment receipt, GST summary and cashier closing.'],
  ['Kitchen', '1 KOT display or small computer', 'Android tablet or Windows mini PC in kiosk mode', '80mm KOT thermal printer', 'Food order tickets by table, server and preparation notes.'],
  ['Store Room', '1 basic computer', 'Windows 11 Home/Pro or Ubuntu LTS with Chrome', 'A4 printer optional', 'Grocery inward/outward, supplier bills, stock issue to kitchen and low-stock checks.'],
  ['Banquet / Manager Desk', '1 computer shared by manager', 'Windows 11 Pro laptop/desktop, Chrome/Edge', 'A4 printer', 'Hall enquiry, function sheet, menu plan, advance receipt and final event invoice.'],
  ['Accounts / Owner', '1 computer or laptop', 'Windows 11 Pro recommended; macOS okay for owner review', 'A4 printer', 'Daily sales, GST summaries, pending balances, expenses and audit review.'],
  ['Housekeeping', 'Mobile/tablet or shared reception system', 'Android phone/tablet preferred; Windows shared PC optional', 'No printer required', 'Room cleaning, hot water, linen, room service and maintenance task status.'],
  ['Main Local Server', '1 dedicated mini PC if multi-counter grows', 'Ubuntu Server 24.04 LTS or Windows 11 Pro; fixed IP and daily backup', 'No direct printer required', 'Runs database/app locally for all counters when internet is not dependable.']
];
const osPlan = [
  ['Default Counter OS', 'Windows 11 Pro', 'Best for printer drivers, billing counters, A4 printers, thermal printers and staff familiarity.'],
  ['Kitchen / Housekeeping', 'Android tablet or Windows kiosk', 'Simple touch operation, less typing, easy wall-mounted KOT or task screen.'],
  ['Server Option', 'Ubuntu Server LTS', 'Stable for future central database/server PC; owner should keep one trained technician for maintenance.'],
  ['Browser Standard', 'Chrome or Edge', 'Same browser on every system keeps UI and print layout consistent.']
];
const printerPlan = [
  ['A4 Print', 'Room confirmation, check-in form, check-out final bill, banquet quotation, banquet final invoice, store reports and accounts reports.'],
  ['Thermal Print', 'Restaurant table bill, KOT, parcel receipt, quick advance receipt and small payment slip.'],
  ['No Print', 'Kitchen display, housekeeping tasks and manager dashboard can stay screen-only unless paper is required.']
];
const operatingSoftwarePlan = [
  ['Admin / Owner', 'Admin Control', 'Dashboard, users, rates, GST reports, balances, audit, settings, backups', 'A4 reports', 'Daily sales SMS, high balance alert, backup alert', 'Full property control'],
  ['Reception', 'Front Desk Software', 'Room booking, advance receipt, check-in receipt, check-out report, walk-in history', 'A4 mandatory', 'Booking confirmation, check-in welcome, balance reminder', 'Rooms/banquet/walk-ins only'],
  ['Manager', 'Manager Console', 'All department verification, day-wise reports, staff attendance, guest issue follow-up', 'A4 reports', 'Daily summary and incident alerts', 'Verification and approval'],
  ['Kitchen', 'KOT Software', 'Food order queue, table, server ID, preparation status, parcel/takeaway token', 'Thermal KOT', 'Kitchen delay alert to manager', 'Kitchen orders only'],
  ['Food Billing', 'Restaurant POS', 'Dine-in table bill, takeaway bill, GST, UPI QR, payment mode, cashier closing', '80mm thermal bill', 'Payment receipt SMS/WhatsApp', 'Restaurant bills only'],
  ['Dobi & Housekeeping', 'Laundry / Room Service', 'Linen issue/return, room cleaning, hot water, towel/bed sheet status, room service task', 'Screen only; A4 monthly report', 'Room ready alert to reception', 'Rooms/halls cleaning only'],
  ['Security', 'Gate & Visitor Log', 'Guest vehicle, supplier entry, banquet crowd, night audit note, key handover', 'A4 visitor/day report optional', 'Visitor/incident alert to manager', 'Gate/visitor/security only'],
  ['Takeaway', 'Parcel Counter', 'Token number, customer phone, food items, payment, kitchen KOT, parcel delivery status', 'Thermal token + thermal bill', 'Order ready WhatsApp/SMS', 'Parcel/takeaway only'],
  ['Store', 'Store & Grocery', 'Grocery inward/outward, supplier bill, kitchen issue, stock value, low stock', 'A4 inward/outward report', 'Low stock and supplier due alert', 'Store room only'],
  ['Server / Waiter', 'Table Order Pad', 'Table order, item notes, server ID, KOT push, bill request', 'No direct printer', 'Order status visible to kitchen/billing', 'Order entry only'],
  ['Accounts', 'Accounts Desk', 'Day book, ledger, cash book, balance sheet, GST summary, pending balances', 'A4 reports', 'Daily summary to owner', 'Accounts only']
];
const roleScopeCards = [
  ['Server System', 'Restaurant Ops, KOT, waiter order, thermal bill, takeaway dispatch', 'Thermal printer near food billing.'],
  ['Reception System', 'Rooms/banquet booking, advance receipt, check-in receipt, check-out report, walk-in customers', 'A4 printer mandatory at reception.'],
  ['Manager System', 'All reports, staff attendance, security notes, date-to-date verification', 'A4 report printer.'],
  ['Kitchen System', 'KOT view, order status, ready/served tracking', 'Thermal KOT printer or kitchen display.'],
  ['Security System', 'Gate visitor, supplier entry, incident note, attendance', 'A4 optional; screen-first.'],
  ['Store Room System', 'Grocery inward/outward, supplier bill, kitchen issue, low stock', 'A4 optional for daily store report.'],
  ['Accountant System', 'Day book, ledger, cash book, balance sheet, GST, pending balances', 'A4 printer mandatory.']
];
const alertTemplates = [
  ['Booking Confirmation', 'WhatsApp/SMS', 'Dear guest, your ANVI GRAND booking is confirmed. Advance received: {advance}. Balance: {balance}.'],
  ['Check-in Welcome', 'WhatsApp', 'Welcome to ANVI GRAND. WiFi, hot water and room service details are available at reception.'],
  ['Restaurant Bill Paid', 'SMS/WhatsApp', 'Thank you for dining at IRAA dine. Bill amount: {total}. Payment: {payment_mode}.'],
  ['Takeaway Ready', 'WhatsApp/SMS', 'Your IRAA dine takeaway order is ready. Please collect from parcel counter.'],
  ['Room Ready', 'Internal Alert', 'Room {room} cleaned and ready. Housekeeping updated the status.'],
  ['Low Stock', 'Internal Alert', '{item} stock is low. Store room should raise purchase/inward entry.'],
  ['Security Incident', 'WhatsApp to Manager', 'Security note: {details}. Please review at manager desk.']
];

const contentBlank = { id: null, content_type: 'ROOM', title: '', description: '', image_url: '', price: '', unit_label: '', capacity: '', display_order: 0, is_active: true };
const bookingBlank = {
  id: null,
  booking_type: 'ROOM',
  booking_date: today(),
  end_date: today(),
  time_slot: '',
  customer_name: '',
  customer_phone: '',
  customer_address: '',
  item_title: '',
  table_number: '',
  server_id: '',
  waiter_name: '',
  supplier_name: '',
  order_status: 'NEW',
  delivery_status: '',
  dispatch_details: '',
  upi_qr_text: '',
  guest_count: '',
  food_plan: 'WITHOUT_FOOD',
  food_details: '',
  complimentary_breakfast: '',
  room_facilities: 'WiFi, hot water, room service',
  travel_notes: 'Near railway station / bus stand / airport details',
  print_format: 'A4',
  gst_percent: '',
  gst_amount: '',
  total_amount: '',
  advance_amount: '',
  payment_mode: 'Cash',
  status: 'ENQUIRY',
  notes: ''
};
const taskBlank = { id: null, task_date: today(), area: 'RECEPTION', title: '', assigned_to: '', amount: '', status: 'OPEN', notes: '' };
const stockBlank = { id: null, movement_date: today(), direction: 'INWARD', item_name: '', supplier_name: '', quantity: '', unit_label: '', amount: '', purpose: '', notes: '' };
const staffBlank = { id: null, staff_name: '', role: 'WAITER', phone: '', address: '', shift_label: '', is_active: true };
const attendanceBlank = { staff_id: '', attendance_date: today(), staff_name: '', role: 'WAITER', status: 'PRESENT', check_in: '', check_out: '', notes: '' };
const walkinBlank = { visit_date: today(), customer_name: '', customer_phone: '', purpose: '', notes: '' };
const profileBlank = {
  hotel_name: 'ANVI GRAND',
  restaurant_name: 'IRAA dine',
  platform_name: 'ANVI GRAND Operations',
  address: 'Near Benz Circle, Eluru Road, Vijayawada, Krishna Dist, Andhra Pradesh',
  phone: '7569494949',
  email: '',
  admin_phone: '7569494949',
  reception_phone: '7569494949',
  restaurant_phone: '7569494949'
};

function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

function Field({ label, children }) {
  return <label><span className="field-label">{label}</span>{children}</label>;
}

function bookingLabel(type) {
  if (type === 'ROOM') return 'Room Booking';
  if (type === 'BANQUET') return 'Banquet Booking';
  return 'Restaurant Order';
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function taxBreakup(row) {
  const total = Number(row.total_amount || 0);
  const gst = Number(row.gst_amount || 0);
  const taxable = Math.max(total - gst, 0);
  return {
    taxable,
    gst,
    cgst: gst / 2,
    sgst: gst / 2,
    advance: Number(row.advance_amount || 0),
    balance: Number(row.balance_amount || Math.max(total - Number(row.advance_amount || 0), 0))
  };
}

export default function HospitalityView({ currentUser = null }) {
  const userRole = String(currentUser?.role || '').toUpperCase();
  const isManagerScope = userRole === 'ADMIN';
  const isServerScope = userRole === 'SERVER';
  const scopeLabel = isManagerScope ? 'Full manager/admin control' : isServerScope ? 'Server restaurant scope' : 'Department daily-work scope';
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeMasterType, setActiveMasterType] = useState('ROOM');
  const [summary, setSummary] = useState(null);
  const [masterRows, setMasterRows] = useState([]);
  const [roomRows, setRoomRows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [calendarRows, setCalendarRows] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stockRows, setStockRows] = useState([]);
  const [staffRows, setStaffRows] = useState([]);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [walkinRows, setWalkinRows] = useState([]);
  const [contentForm, setContentForm] = useState(contentBlank);
  const [bookingForm, setBookingForm] = useState(bookingBlank);
  const [taskForm, setTaskForm] = useState(taskBlank);
  const [stockForm, setStockForm] = useState(stockBlank);
  const [staffForm, setStaffForm] = useState(staffBlank);
  const [attendanceForm, setAttendanceForm] = useState(attendanceBlank);
  const [walkinForm, setWalkinForm] = useState(walkinBlank);
  const [profileForm, setProfileForm] = useState(profileBlank);
  const [filters, setFilters] = useState({ from: today(), to: today(), bookingType: 'ALL' });
  const [calendarDate, setCalendarDate] = useState(today());
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => { loadSummary(); loadRoomMasters(); loadPeople(); }, []);
  useEffect(() => { loadMaster(activeMasterType); }, [activeMasterType]);
  useEffect(() => { loadWork(); }, [filters.from, filters.to, filters.bookingType]);
  useEffect(() => { loadCalendar(); }, [calendarDate]);

  async function loadSummary() {
    try {
      const [summaryData, profileData] = await Promise.all([fetchHospitalitySummary(), fetchHospitalityProfile()]);
      setSummary(summaryData);
      setProfileForm({ ...profileBlank, ...profileData });
    } catch (_err) {
      setErrorMessage('Unable to load ANVI GRAND operations.');
    }
  }

  async function loadMaster(type = activeMasterType) {
    try {
      setMasterRows(await fetchHospitalityContent(type));
    } catch (_err) {
      setMasterRows([]);
    }
  }

  async function loadRoomMasters() {
    try {
      setRoomRows(await fetchHospitalityContent('ROOM'));
    } catch (_err) {
      setRoomRows([]);
    }
  }

  async function loadCalendar() {
    try {
      setCalendarRows(await fetchHospitalityBookings({ from: monthStart(calendarDate), to: monthEnd(calendarDate), type: 'ROOM' }));
    } catch (_err) {
      setCalendarRows([]);
    }
  }

  async function loadWork() {
    try {
      const [bookingRows, taskRows, movementRows, attendance, walkins] = await Promise.all([
        fetchHospitalityBookings({ from: filters.from, to: filters.to, type: filters.bookingType }),
        fetchHospitalityTasks({ from: filters.from, to: filters.to }),
        fetchHospitalityStockMovements({ from: filters.from, to: filters.to }),
        fetchHospitalityAttendance({ from: filters.from, to: filters.to }),
        fetchHospitalityWalkins({ from: filters.from, to: filters.to })
      ]);
      setBookings(bookingRows);
      setTasks(taskRows);
      setStockRows(movementRows);
      setAttendanceRows(attendance);
      setWalkinRows(walkins);
    } catch (_err) {
      setErrorMessage('Unable to load operations data.');
    }
  }

  async function loadPeople() {
    try {
      setStaffRows(await fetchHospitalityStaff('ALL'));
    } catch (_err) {
      setStaffRows([]);
    }
  }

  function resetMessages() {
    setStatusMessage('');
    setErrorMessage('');
  }

  function startBooking(type) {
    setActiveSection('bookings');
    setBookingForm({
      ...bookingBlank,
      booking_type: type,
      food_plan: type === 'FOOD' ? 'WITH_FOOD' : 'WITHOUT_FOOD',
      item_title: type === 'FOOD' ? (profileForm.restaurant_name || 'Restaurant Order') : '',
      time_slot: type === 'ROOM' ? 'Check-in' : type === 'BANQUET' ? 'Function Slot' : 'Dine-in / Parcel'
    });
  }

  function editBooking(row) {
    setActiveSection('bookings');
    setBookingForm({ ...bookingBlank, ...row });
  }

  function editMaster(row) {
    setActiveSection('masters');
    setActiveMasterType(row.content_type);
    setContentForm({ ...contentBlank, ...row });
  }

  function editTask(row) {
    setActiveSection('tasks');
    setTaskForm({ ...taskBlank, ...row });
  }

  function editStock(row) {
    setActiveSection('restaurant');
    setStockForm({ ...stockBlank, ...row });
  }

  function editStaff(row) {
    setActiveSection('people');
    setStaffForm({ ...staffBlank, ...row });
  }

  function startDepartmentTask(area, title) {
    setActiveSection('tasks');
    setTaskForm({ ...taskBlank, area, title, assigned_to: area, notes: 'Created from Operating Software module.' });
  }

  function openWhatsAppAlert(templateText = '') {
    const phone = (bookingForm.customer_phone || profileForm.admin_phone || profileForm.phone || '').replace(/[^\d]/g, '');
    const balance = Math.max(Number(bookingForm.total_amount || 0) - Number(bookingForm.advance_amount || 0), 0);
    const text = templateText
      .replace('{advance}', formatMoney(bookingForm.advance_amount))
      .replace('{balance}', formatMoney(balance))
      .replace('{total}', formatMoney(bookingForm.total_amount))
      .replace('{payment_mode}', bookingForm.payment_mode || 'Cash')
      .replace('{room}', bookingForm.table_number || bookingForm.item_title || '')
      .replace('{item}', stockForm.item_name || '')
      .replace('{details}', taskForm.title || taskForm.notes || '');
    const url = `https://wa.me/${phone || ''}?text=${encodeURIComponent(text || 'ANVI GRAND update')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  async function printBooking(row, purpose = 'Final Bill', format = row.print_format || 'A4') {
    const profile = profileForm || {};
    const tax = taxBreakup(row);
    const isThermal = format === 'THERMAL';
    const lineItems = String(row.food_details || row.item_title || row.notes || 'Booking charge')
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
    const details = [
      ['Guest', row.customer_name],
      ['Phone', row.customer_phone],
      ['Booking', bookingLabel(row.booking_type)],
      [row.booking_type === 'FOOD' ? 'Table' : row.booking_type === 'ROOM' ? 'Room' : 'Hall', row.table_number || row.item_title],
      ['Server / Supplier', row.server_id],
      ['Date', `${row.booking_date}${row.end_date && row.end_date !== row.booking_date ? ` to ${row.end_date}` : ''}`],
      ['Slot', row.time_slot],
      ['Guests', row.guest_count],
      ['Food Plan', row.food_plan === 'WITH_FOOD' ? 'With food' : 'Without food'],
      ['Breakfast', row.complimentary_breakfast],
      ['Facilities', row.room_facilities],
      ['Location Notes', row.travel_notes]
    ].filter(([, value]) => value);
    const css = isThermal
      ? 'body{font-family:Arial,sans-serif;width:72mm;margin:0;padding:8px;color:#111;font-size:12px}.brand{display:flex;align-items:center;gap:4px;font-weight:900;color:#0f7490;font-size:12px}.brand img{width:24mm;height:auto}.center{text-align:center}.line{border-top:1px dashed #111;margin:8px 0}.row{display:flex;justify-content:space-between;gap:8px}.muted{font-size:11px;color:#444}h1{font-size:15px;margin:0}h2{font-size:13px;margin:4px 0 0}table{width:100%;border-collapse:collapse}td{padding:2px 0;vertical-align:top}.total{font-weight:700;font-size:13px}'
      : 'body{font-family:Arial,sans-serif;margin:28px;color:#1f2937}.bill{max-width:820px;margin:0 auto;border:1px solid #ddd;padding:24px;position:relative}.brand{position:absolute;left:18px;top:16px;display:flex;align-items:center;gap:6px;font-weight:900;color:#0f7490}.brand img{width:82px;height:auto}h1{margin:0;color:#7f1d1d}h2{margin:4px 0 18px;color:#14532d}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 22px}.line{border-top:1px solid #ddd;margin:16px 0}table{width:100%;border-collapse:collapse;margin-top:10px}th,td{border-bottom:1px solid #eee;padding:8px;text-align:left}.amount{text-align:right}.total{font-weight:700;background:#fff7ed}.muted{color:#6b7280;font-size:12px}.center{text-align:center}@media print{body{margin:0}.bill{border:0}}';
    const rows = details.map(([label, value]) => `<div><span class="muted">${escapeHtml(label)}</span><br><strong>${escapeHtml(value)}</strong></div>`).join('');
    const itemRows = lineItems.length
      ? lineItems.map((item, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(item)}</td><td class="amount">${index === 0 ? formatMoney(tax.taxable) : ''}</td></tr>`).join('')
      : `<tr><td>1</td><td>${escapeHtml(row.item_title || 'Booking charge')}</td><td class="amount">${formatMoney(tax.taxable)}</td></tr>`;
    const qrText = row.upi_qr_text || (String(row.payment_mode || '').toLowerCase().includes('upi') ? `upi://pay?pn=${encodeURIComponent(profile.hotel_name || 'ANVI GRAND')}&am=${Number(row.balance_amount || row.total_amount || 0)}` : '');
    const qrImage = qrText ? await QRCode.toDataURL(qrText, { margin: 1, width: isThermal ? 120 : 150 }).catch(() => '') : '';
    const qrBlock = qrImage ? `<div class="center"><img src="${qrImage}" alt="UPI QR" style="width:${isThermal ? '34mm' : '120px'};height:auto"><div class="muted">${escapeHtml(qrText)}</div></div>` : '';
    const brand = '<div class="brand"><img src="/badizo-logo-transparent.png" alt="Badizo"><span>Powered by Badizo</span></div>';
    const html = `<!doctype html><html><head><title>${escapeHtml(purpose)} - ${escapeHtml(profile.hotel_name || 'ANVI GRAND')}</title><style>${css}</style></head><body><div class="bill">${brand}<div class="center"><h1>${escapeHtml(profile.hotel_name || 'ANVI GRAND')}</h1><h2>${escapeHtml(purpose)}</h2><div class="muted">${escapeHtml(profile.address || '')}</div><div class="muted">Phone: ${escapeHtml(profile.phone || profile.reception_phone || '')}</div></div><div class="line"></div><div class="${isThermal ? '' : 'grid'}">${rows}</div><div class="line"></div><table><thead><tr><th>#</th><th>Particulars</th><th class="amount">Amount</th></tr></thead><tbody>${itemRows}<tr><td></td><td>CGST</td><td class="amount">${formatMoney(tax.cgst)}</td></tr><tr><td></td><td>SGST</td><td class="amount">${formatMoney(tax.sgst)}</td></tr><tr class="total"><td></td><td>Total</td><td class="amount">${formatMoney(row.total_amount)}</td></tr><tr><td></td><td>Advance / Paid</td><td class="amount">${formatMoney(tax.advance)}</td></tr><tr class="total"><td></td><td>Balance</td><td class="amount">${formatMoney(tax.balance)}</td></tr></tbody></table><div class="line"></div>${qrBlock}<div class="muted">Payment: ${escapeHtml(row.payment_mode || 'Cash / UPI / Card')} | Order: ${escapeHtml(row.order_status || '')} | Delivery: ${escapeHtml(row.delivery_status || '')}</div><p class="center">Thank you. Visit again.</p></div><script>window.onload=function(){window.print();};</script></body></html>`;
    const popup = window.open('', '_blank', 'width=900,height=700');
    if (!popup) {
      setErrorMessage('Popup blocked. Please allow popups for printing.');
      return;
    }
    popup.document.write(html);
    popup.document.close();
  }

  async function handleProfileSave(event) {
    event.preventDefault();
    resetMessages();
    try {
      const result = await saveHospitalityProfile(profileForm);
      setProfileForm({ ...profileBlank, ...(result.profile || {}) });
      setStatusMessage('Hotel profile saved.');
      await loadSummary();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Unable to save hotel profile.');
    }
  }

  async function handleMasterSave(event) {
    event.preventDefault();
    resetMessages();
    try {
      await saveHospitalityContent({ ...contentForm, content_type: activeMasterType });
      setContentForm({ ...contentBlank, content_type: activeMasterType });
      setStatusMessage('Master saved.');
      await Promise.all([loadMaster(activeMasterType), loadRoomMasters(), loadSummary()]);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Unable to save master.');
    }
  }

  async function handleMasterDelete(row) {
    if (!window.confirm(`Delete ${row.title}?`)) return;
    resetMessages();
    try {
      await deleteHospitalityContent(row.id);
      setStatusMessage('Master deleted.');
      await Promise.all([loadMaster(activeMasterType), loadRoomMasters()]);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Unable to delete master.');
    }
  }

  async function handleBookingSave(event) {
    event.preventDefault();
    resetMessages();
    try {
      await saveHospitalityBooking(bookingForm);
      setBookingForm({ ...bookingBlank, booking_type: bookingForm.booking_type });
      setStatusMessage(`${bookingLabel(bookingForm.booking_type)} saved.`);
      await Promise.all([loadWork(), loadCalendar(), loadSummary()]);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Unable to save booking.');
    }
  }

  async function handleTaskSave(event) {
    event.preventDefault();
    resetMessages();
    try {
      await saveHospitalityTask(taskForm);
      setTaskForm({ ...taskBlank, area: taskForm.area });
      setStatusMessage('Maintenance task saved.');
      await Promise.all([loadWork(), loadSummary()]);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Unable to save task.');
    }
  }

  async function handleStockSave(event) {
    event.preventDefault();
    resetMessages();
    try {
      await saveHospitalityStockMovement(stockForm);
      setStockForm({ ...stockBlank, direction: stockForm.direction });
      setStatusMessage('Restaurant/store movement saved.');
      await Promise.all([loadWork(), loadSummary()]);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Unable to save stock movement.');
    }
  }

  async function handleStaffSave(event) {
    event.preventDefault();
    resetMessages();
    try {
      await saveHospitalityStaff(staffForm);
      setStaffForm(staffBlank);
      setStatusMessage('Staff/security record saved.');
      await loadPeople();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Unable to save staff.');
    }
  }

  async function handleAttendanceSave(event) {
    event.preventDefault();
    resetMessages();
    try {
      await saveHospitalityAttendance(attendanceForm);
      setAttendanceForm(attendanceBlank);
      setStatusMessage('Attendance saved.');
      await loadWork();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Unable to save attendance.');
    }
  }

  async function handleWalkinSave(event) {
    event.preventDefault();
    resetMessages();
    try {
      await saveHospitalityWalkin(walkinForm);
      setWalkinForm(walkinBlank);
      setStatusMessage('Walk-in customer saved.');
      await loadWork();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Unable to save walk-in customer.');
    }
  }

  function bookingsForDate(rows, date, type = 'ALL') {
    return rows.filter((row) => {
      if (type !== 'ALL' && row.booking_type !== type) return false;
      if (row.status === 'CANCELLED') return false;
      return row.booking_date <= date && (row.end_date || row.booking_date) >= date;
    });
  }

  function roomStatusForDate(date) {
    const totalRooms = roomRows.filter((row) => row.is_active !== 0).length;
    const bookedKeys = new Set(bookingsForDate(calendarRows, date, 'ROOM').map((row) => row.table_number || row.item_title || `booking-${row.id}`));
    const booked = bookedKeys.size;
    const available = Math.max(totalRooms - booked, 0);
    if (totalRooms > 0 && booked >= totalRooms) return { tone: 'full', label: 'Full', booked, available, totalRooms };
    if (booked > 0) return { tone: 'partial', label: 'Some Available', booked, available, totalRooms };
    return { tone: 'free', label: 'Available', booked, available: totalRooms, totalRooms };
  }

  function selectCalendarDate(date) {
    setCalendarDate(date);
    setFilters({ from: date, to: date, bookingType: 'ALL' });
    setActiveSection('bookings');
  }

  function calendarDays() {
    const start = toDate(monthStart(calendarDate));
    const end = toDate(monthEnd(calendarDate));
    const days = [];
    for (let day = 1; day <= end.getDate(); day += 1) {
      days.push(toIso(new Date(start.getFullYear(), start.getMonth(), day)));
    }
    return days;
  }

  function dailyBookingRows(date) {
    const inCalendarMonth = date >= monthStart(calendarDate) && date <= monthEnd(calendarDate);
    return bookingsForDate(inCalendarMonth ? calendarRows : bookings, date, 'ROOM');
  }

  const cards = useMemo(() => {
    const bookingsSummary = summary?.bookings || {};
    const taskSummary = summary?.tasks || {};
    const stockSummary = summary?.stock || {};
    const activeBookings = bookings.filter((row) => row.status !== 'CANCELLED');
    return [
      ['Active Bookings', activeBookings.length],
      ['Today Bookings', bookingsSummary.today_bookings || 0],
      ['Advance Total', formatMoney(bookingsSummary.advance_total)],
      ['Balance Pending', formatMoney(bookingsSummary.balance_total)],
      ['Restaurant Orders', activeBookings.filter((row) => row.booking_type === 'FOOD').length],
      ['Pending Tasks', taskSummary.pending_tasks || 0],
      ['Store Inward', formatMoney(stockSummary.inward_amount)],
      ['Store Outward', formatMoney(stockSummary.outward_amount)]
    ];
  }, [bookings, summary]);

  const sections = [
    ['dashboard', 'Dashboard'],
    ['bookings', 'Bookings'],
    ['systems', 'Systems & Printers'],
    ['software', 'Operating Software'],
    ['masters', 'Rooms / Halls / Menu'],
    ['restaurant', 'Restaurant Store'],
    ['restaurantOps', 'Restaurant Ops'],
    ['people', 'Staff & Walk-ins'],
    ['accounts', 'Accounts'],
    ['tasks', 'Maintenance Tasks'],
    ['settings', 'Hotel Settings']
  ].filter(([key]) => {
    if (isManagerScope) return true;
    if (isServerScope) return ['dashboard', 'bookings', 'restaurantOps', 'restaurant', 'tasks', 'systems', 'software'].includes(key);
    return ['dashboard', 'tasks', 'systems', 'software'].includes(key);
  });

  const recentRows = bookings.slice(0, 5);
  const pendingTasks = tasks.filter((row) => ['OPEN', 'IN_PROGRESS'].includes(row.status)).slice(0, 6);
  const selectedDayBookings = bookingsForDate(bookings, filters.from, 'ALL');
  const dayIncome = selectedDayBookings.reduce((sum, row) => sum + Number(row.advance_amount || 0), 0);
  const daySales = selectedDayBookings.reduce((sum, row) => sum + Number(row.total_amount || 0), 0);
  const dayReceivables = selectedDayBookings.reduce((sum, row) => sum + Number(row.balance_amount || 0), 0);
  const dayExpenses = tasks.reduce((sum, row) => sum + Number(row.amount || 0), 0) + stockRows.filter((row) => row.direction === 'INWARD').reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const dayCash = selectedDayBookings.filter((row) => String(row.payment_mode || '').toLowerCase().includes('cash')).reduce((sum, row) => sum + Number(row.advance_amount || 0), 0);
  const accountCards = [
    ['Day Sales', formatMoney(daySales)],
    ['Cash Book', formatMoney(dayCash)],
    ['Collection', formatMoney(dayIncome)],
    ['Pending Balance', formatMoney(dayReceivables)],
    ['Expenses / Store', formatMoney(dayExpenses)],
    ['Net Position', formatMoney(dayIncome - dayExpenses)]
  ];
  const dayBookRows = [
    ...selectedDayBookings.map((row) => ({ date: row.booking_date, type: 'Booking', party: row.customer_name, details: `${bookingLabel(row.booking_type)} - ${row.item_title || row.table_number || ''}`, debit: row.balance_amount, credit: row.advance_amount, mode: row.payment_mode })),
    ...stockRows.map((row) => ({ date: row.movement_date, type: row.direction === 'INWARD' ? 'Purchase/Inward' : 'Issue/Outward', party: row.supplier_name || row.purpose, details: row.item_name, debit: row.direction === 'INWARD' ? row.amount : 0, credit: row.direction === 'OUTWARD' ? row.amount : 0, mode: row.direction })),
    ...tasks.filter((row) => Number(row.amount || 0) > 0).map((row) => ({ date: row.task_date, type: 'Expense/Task', party: row.assigned_to || row.area, details: row.title, debit: row.amount, credit: 0, mode: row.status }))
  ];
  const ledgerRows = Object.values(dayBookRows.reduce((acc, row) => {
    const key = row.party || row.type;
    acc[key] = acc[key] || { party: key, debit: 0, credit: 0 };
    acc[key].debit += Number(row.debit || 0);
    acc[key].credit += Number(row.credit || 0);
    return acc;
  }, {}));
  const threeDayDates = [
    ['Yesterday', addDays(today(), -1)],
    ['Today', today()],
    ['Tomorrow', addDays(today(), 1)]
  ];

  return (
    <div className="hospitality-view anvi-ops-app">
      <section className="hospitality-hero panel">
        <div>
          <span className="hospitality-eyebrow">ANVI GRAND Operations App</span>
          <h1>Rooms, Banquet & Restaurant Control</h1>
          <p>{profileForm.address}. Reception: {profileForm.reception_phone || profileForm.phone}. Restaurant: {profileForm.restaurant_phone || profileForm.phone}. Current scope: {scopeLabel}.</p>
        </div>
        <div className="anvi-quick-actions">
          <button type="button" className="primary-button compact-primary" onClick={() => startBooking('ROOM')}>New Room Booking</button>
          <button type="button" className="primary-button compact-primary" onClick={() => startBooking('BANQUET')}>New Banquet Booking</button>
          <button type="button" className="primary-button compact-primary" onClick={() => startBooking('FOOD')}>New Restaurant Order</button>
        </div>
      </section>

      <nav className="anvi-ops-nav" aria-label="ANVI operations sections">
        {sections.map(([key, label]) => <button key={key} type="button" className={`mode-pill ${activeSection === key ? 'active' : ''}`} onClick={() => setActiveSection(key)}>{label}</button>)}
      </nav>

      {(statusMessage || errorMessage) && <div className={`hospitality-message ${errorMessage ? 'danger' : 'success'}`}>{errorMessage || statusMessage}</div>}

      <section className="hospitality-kpi-grid">
        {cards.map(([label, value]) => <div className="panel hospitality-kpi" key={label}><span>{label}</span><strong>{value}</strong></div>)}
      </section>

      {activeSection === 'dashboard' && (
        <section className="hospitality-two-column">
          <div className="panel">
            <div className="panel-header green"><h2 className="panel-title">Today / Upcoming Bookings</h2></div>
            <div className="panel-body hospitality-section-body">
              <table className="history-table hospitality-table">
                <thead><tr><th>Date</th><th>Type</th><th>Guest</th><th>Item</th><th>Balance</th><th>Status</th></tr></thead>
                <tbody>{recentRows.length === 0 ? <tr><td colSpan="6">No bookings yet.</td></tr> : recentRows.map((row) => (
                  <tr key={row.id}><td>{row.booking_date}<span className="muted">{row.time_slot}</span></td><td>{row.booking_type}</td><td>{row.customer_name}<span className="muted">{row.customer_phone}</span></td><td>{row.item_title || '-'}</td><td>{formatMoney(row.balance_amount)}</td><td>{row.status}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </div>
          <div className="panel">
            <div className="panel-header green"><h2 className="panel-title">Open Maintenance</h2></div>
            <div className="panel-body hospitality-section-body">
              <table className="history-table hospitality-table">
                <thead><tr><th>Date</th><th>Area</th><th>Task</th><th>Status</th></tr></thead>
                <tbody>{pendingTasks.length === 0 ? <tr><td colSpan="4">No pending tasks.</td></tr> : pendingTasks.map((row) => (
                  <tr key={row.id}><td>{row.task_date}</td><td>{row.area}</td><td>{row.title}<span className="muted">{row.assigned_to}</span></td><td>{row.status}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'bookings' && (
        <section className="panel">
          <div className="panel-header green"><h2 className="panel-title">Rooms, Banquet & Restaurant Bookings</h2></div>
          <div className="panel-body hospitality-section-body">
            <div className="anvi-booking-planner">
              <div className="panel anvi-calendar-panel">
                <div className="anvi-calendar-head">
                  <button className="secondary-button" type="button" onClick={() => setCalendarDate(addDays(monthStart(calendarDate), -1))}>Prev</button>
                  <strong>{toDate(calendarDate).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</strong>
                  <button className="secondary-button" type="button" onClick={() => setCalendarDate(addDays(monthEnd(calendarDate), 1))}>Next</button>
                </div>
                <div className="anvi-calendar-legend"><span className="free">Green: rooms empty</span><span className="partial">Blue: some rooms available</span><span className="full">Red: rooms full</span></div>
                <div className="anvi-calendar-grid">
                  {calendarDays().map((date) => {
                    const status = roomStatusForDate(date);
                    const isSelected = date === filters.from && filters.from === filters.to;
                    return (
                      <button key={date} type="button" className={`anvi-calendar-day ${status.tone} ${isSelected ? 'selected' : ''}`} onClick={() => selectCalendarDate(date)} title={`${status.label}: ${status.available}/${status.totalRooms || 0} available`}>
                        <span>{toDate(date).getDate()}</span>
                        <small>{status.available}/{status.totalRooms || 0}</small>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="panel anvi-three-day-panel">
                <div className="panel-header green"><h2 className="panel-title">Yesterday / Today / Tomorrow Rooms</h2></div>
                <div className="panel-body hospitality-section-body">
                  {threeDayDates.map(([label, date]) => {
                    const rows = dailyBookingRows(date);
                    const status = roomStatusForDate(date);
                    return (
                      <div className="anvi-day-summary" key={date}>
                        <strong>{label} <span>{date}</span></strong>
                        <p className={`anvi-day-pill ${status.tone}`}>{status.label}: {status.available}/{status.totalRooms || 0} rooms available</p>
                        {rows.length === 0 ? <p className="muted">No room bookings.</p> : rows.map((row) => <p key={row.id}>{row.table_number || row.item_title || 'Room'} - {row.customer_name} <span className="muted">{row.status}</span></p>)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <form className="hospitality-form-grid" onSubmit={handleBookingSave}>
              <Field label="Booking Type"><select className="select" value={bookingForm.booking_type} onChange={(event) => setBookingForm((current) => ({ ...current, booking_type: event.target.value }))}>{bookingTypes.filter((type) => type !== 'ALL').map((type) => <option key={type} value={type}>{bookingLabel(type)}</option>)}</select></Field>
              <Field label="Date From"><input className="field" type="date" value={bookingForm.booking_date} onChange={(event) => setBookingForm((current) => ({ ...current, booking_date: event.target.value, end_date: current.end_date || event.target.value }))} /></Field>
              <Field label="Date To"><input className="field" type="date" value={bookingForm.end_date || bookingForm.booking_date} onChange={(event) => setBookingForm((current) => ({ ...current, end_date: event.target.value }))} /></Field>
              <Field label="Slot / Time"><input className="field" value={bookingForm.time_slot} onChange={(event) => setBookingForm((current) => ({ ...current, time_slot: event.target.value }))} placeholder="Check-in / Lunch / Evening / Full day" /></Field>
              <Field label="Customer Name"><input className="field" value={bookingForm.customer_name} onChange={(event) => setBookingForm((current) => ({ ...current, customer_name: event.target.value }))} required /></Field>
              <Field label="Phone"><input className="field" value={bookingForm.customer_phone} onChange={(event) => setBookingForm((current) => ({ ...current, customer_phone: event.target.value }))} required /></Field>
              <Field label="Room / Hall / Food Item"><input className="field" value={bookingForm.item_title} onChange={(event) => setBookingForm((current) => ({ ...current, item_title: event.target.value }))} /></Field>
              <Field label="Room / Table / Hall No"><input className="field" value={bookingForm.table_number || ''} onChange={(event) => setBookingForm((current) => ({ ...current, table_number: event.target.value }))} placeholder="Room 203 / Table 5 / Hall A" /></Field>
              <Field label="Server / Supplier ID"><input className="field" value={bookingForm.server_id || ''} onChange={(event) => setBookingForm((current) => ({ ...current, server_id: event.target.value }))} placeholder="Server name, waiter ID, supplier ref" /></Field>
              <Field label="Waiter / Order Taken By"><input className="field" value={bookingForm.waiter_name || ''} onChange={(event) => setBookingForm((current) => ({ ...current, waiter_name: event.target.value }))} /></Field>
              <Field label="Supplier / Served By"><input className="field" value={bookingForm.supplier_name || ''} onChange={(event) => setBookingForm((current) => ({ ...current, supplier_name: event.target.value }))} /></Field>
              <Field label="Order Status"><select className="select" value={bookingForm.order_status || 'NEW'} onChange={(event) => setBookingForm((current) => ({ ...current, order_status: event.target.value }))}>{orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></Field>
              <Field label="Delivery Status"><input className="field" value={bookingForm.delivery_status || ''} onChange={(event) => setBookingForm((current) => ({ ...current, delivery_status: event.target.value }))} placeholder="Dine-in / Parcel / Out for delivery / Delivered" /></Field>
              <Field label="Persons / Guests"><input className="field" type="number" value={bookingForm.guest_count} onChange={(event) => setBookingForm((current) => ({ ...current, guest_count: event.target.value }))} /></Field>
              <Field label="Food Plan"><select className="select" value={bookingForm.food_plan || 'WITHOUT_FOOD'} onChange={(event) => setBookingForm((current) => ({ ...current, food_plan: event.target.value }))}><option value="WITHOUT_FOOD">Without Food</option><option value="WITH_FOOD">With Food</option></select></Field>
              <Field label="Print Format"><select className="select" value={bookingForm.print_format || 'A4'} onChange={(event) => setBookingForm((current) => ({ ...current, print_format: event.target.value }))}><option value="A4">A4 Invoice / Form</option><option value="THERMAL">80mm Thermal</option></select></Field>
              <Field label="Total Amount"><input className="field" type="number" value={bookingForm.total_amount} onChange={(event) => setBookingForm((current) => ({ ...current, total_amount: event.target.value }))} /></Field>
              <Field label="Advance"><input className="field" type="number" value={bookingForm.advance_amount} onChange={(event) => setBookingForm((current) => ({ ...current, advance_amount: event.target.value }))} /></Field>
              <Field label="GST %"><input className="field" type="number" value={bookingForm.gst_percent || ''} onChange={(event) => setBookingForm((current) => ({ ...current, gst_percent: event.target.value }))} placeholder="0 / 5 / 12 / 18" /></Field>
              <Field label="GST Amount"><input className="field" type="number" value={bookingForm.gst_amount || ''} onChange={(event) => setBookingForm((current) => ({ ...current, gst_amount: event.target.value }))} placeholder="Auto if blank and GST % given" /></Field>
              <Field label="UPI QR Text"><input className="field" value={bookingForm.upi_qr_text || ''} onChange={(event) => setBookingForm((current) => ({ ...current, upi_qr_text: event.target.value }))} placeholder="upi://pay?... or UPI ID text for QR" /></Field>
              <Field label="Payment Mode"><input className="field" value={bookingForm.payment_mode} onChange={(event) => setBookingForm((current) => ({ ...current, payment_mode: event.target.value }))} placeholder="Cash / UPI / Card" /></Field>
              <Field label="Status"><select className="select" value={bookingForm.status} onChange={(event) => setBookingForm((current) => ({ ...current, status: event.target.value }))}>{bookingStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></Field>
              <Field label="Address"><textarea className="field" rows="2" value={bookingForm.customer_address} onChange={(event) => setBookingForm((current) => ({ ...current, customer_address: event.target.value }))} /></Field>
              <Field label="Food / Decoration Details"><textarea className="field" rows="2" value={bookingForm.food_details || ''} onChange={(event) => setBookingForm((current) => ({ ...current, food_details: event.target.value }))} /></Field>
              <Field label="Room Breakfast / Notes"><textarea className="field" rows="2" value={bookingForm.complimentary_breakfast || ''} onChange={(event) => setBookingForm((current) => ({ ...current, complimentary_breakfast: event.target.value }))} /></Field>
              <Field label="Room Facilities"><textarea className="field" rows="2" value={bookingForm.room_facilities || ''} onChange={(event) => setBookingForm((current) => ({ ...current, room_facilities: event.target.value }))} placeholder="WiFi, hot water, room service, parking, lift" /></Field>
              <Field label="Travel / Nearby Details"><textarea className="field" rows="2" value={bookingForm.travel_notes || ''} onChange={(event) => setBookingForm((current) => ({ ...current, travel_notes: event.target.value }))} placeholder="Near airport, railway station, bus stand, temple, function venue" /></Field>
              <Field label="Dispatch / Delivery Details"><textarea className="field" rows="2" value={bookingForm.dispatch_details || ''} onChange={(event) => setBookingForm((current) => ({ ...current, dispatch_details: event.target.value }))} placeholder="Delivery boy, parcel token, address, dispatch time" /></Field>
              <Field label="Internal Notes"><textarea className="field" rows="2" value={bookingForm.notes} onChange={(event) => setBookingForm((current) => ({ ...current, notes: event.target.value }))} /></Field>
              <button className="primary-button compact-primary" type="submit">{bookingForm.id ? 'Update Booking' : 'Save Booking'}</button>
              <button className="secondary-button" type="button" onClick={() => setBookingForm(bookingBlank)}>Clear</button>
            </form>
            <div className="hospitality-filter-row">
              <input className="field" type="date" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))} />
              <input className="field" type="date" value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))} />
              <select className="select" value={filters.bookingType} onChange={(event) => setFilters((current) => ({ ...current, bookingType: event.target.value }))}>{bookingTypes.map((type) => <option key={type} value={type}>{type === 'ALL' ? 'All Bookings' : bookingLabel(type)}</option>)}</select>
            </div>
            <div className="table-scroll">
              <table className="history-table hospitality-table">
                <thead><tr><th>Dates</th><th>Type</th><th>Customer</th><th>Room/Table</th><th>Food / Notes</th><th>Total</th><th>Advance</th><th>Balance</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{bookings.length === 0 ? <tr><td colSpan="10">No bookings in selected dates.</td></tr> : bookings.map((row) => (
                  <tr key={row.id}><td>{row.booking_date}{row.end_date && row.end_date !== row.booking_date ? ` to ${row.end_date}` : ''}<span className="muted">{row.time_slot || ''}</span></td><td>{bookingLabel(row.booking_type)}</td><td><strong>{row.customer_name}</strong><span className="muted">{row.customer_phone}</span></td><td>{row.table_number || row.item_title || '-'}<span className="muted">{row.server_id || row.item_title || ''}</span></td><td>{row.food_plan === 'WITH_FOOD' ? 'With Food' : 'Without Food'}<span className="muted">{row.food_details || row.complimentary_breakfast || row.notes || ''}</span></td><td>{formatMoney(row.total_amount)}<span className="muted">GST {formatMoney(row.gst_amount)}</span></td><td>{formatMoney(row.advance_amount)}</td><td>{formatMoney(row.balance_amount)}</td><td><span className="status-chip info">{row.status}</span></td><td><div className="table-actions"><button className="secondary-button" type="button" onClick={() => editBooking(row)}>Edit</button><button className="secondary-button" type="button" onClick={() => printBooking(row, 'Advance Booking Receipt', 'A4')}>Advance A4</button><button className="secondary-button" type="button" onClick={() => printBooking(row, 'Check-in Receipt', 'A4')}>Check-in A4</button><button className="secondary-button" type="button" onClick={() => printBooking(row, 'Check-out Report', 'A4')}>Check-out A4</button><button className="secondary-button" type="button" onClick={() => printBooking(row, 'Reprint Final Bill', 'A4')}>Reprint A4</button><button className="secondary-button" type="button" onClick={() => printBooking(row, row.booking_type === 'FOOD' ? 'Restaurant Thermal Bill' : 'Thermal Receipt', 'THERMAL')}>Thermal</button></div></td></tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'accounts' && (
        <section className="panel">
          <div className="panel-header green"><h2 className="panel-title">Day Book, Ledger, Cash Book & Balance Sheet</h2></div>
          <div className="panel-body hospitality-section-body">
            <div className="hospitality-filter-row">
              <input className="field" type="date" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value, to: event.target.value }))} />
              <button className="secondary-button" type="button" onClick={() => setFilters((current) => ({ ...current, from: today(), to: today() }))}>Today</button>
              <button className="secondary-button" type="button" onClick={() => window.print()}>Print A4</button>
            </div>
            <div className="anvi-ops-note">
              <strong>Date-to-date verification:</strong> selected date controls room bookings, restaurant orders, advance receipts, check-in/check-out reports, store movements, day book, ledger and balance summary for A4 verification.
            </div>
            <section className="hospitality-kpi-grid">
              {accountCards.map(([label, value]) => <div className="panel hospitality-kpi" key={label}><span>{label}</span><strong>{value}</strong></div>)}
            </section>
            <div className="hospitality-two-column">
              <div className="panel">
                <div className="panel-header green"><h2 className="panel-title">Day Book</h2></div>
                <div className="panel-body hospitality-section-body">
                  <table className="history-table hospitality-table"><thead><tr><th>Date</th><th>Type</th><th>Party</th><th>Details</th><th>Debit</th><th>Credit</th><th>Mode</th></tr></thead><tbody>{dayBookRows.length === 0 ? <tr><td colSpan="7">No day book entries.</td></tr> : dayBookRows.map((row, index) => <tr key={`${row.type}-${index}`}><td>{row.date}</td><td>{row.type}</td><td>{row.party || '-'}</td><td>{row.details}</td><td>{formatMoney(row.debit)}</td><td>{formatMoney(row.credit)}</td><td>{row.mode}</td></tr>)}</tbody></table>
                </div>
              </div>
              <div className="panel">
                <div className="panel-header green"><h2 className="panel-title">Ledger / Balance Sheet</h2></div>
                <div className="panel-body hospitality-section-body">
                  <table className="history-table hospitality-table"><thead><tr><th>Ledger</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead><tbody>{ledgerRows.length === 0 ? <tr><td colSpan="4">No ledger entries.</td></tr> : ledgerRows.map((row) => <tr key={row.party}><td>{row.party}</td><td>{formatMoney(row.debit)}</td><td>{formatMoney(row.credit)}</td><td>{formatMoney(Number(row.debit || 0) - Number(row.credit || 0))}</td></tr>)}</tbody></table>
                  <div className="anvi-ops-note"><strong>Balance Sheet:</strong> Cash/Bank collection {formatMoney(dayIncome)}, receivables {formatMoney(dayReceivables)}, store/task expenses {formatMoney(dayExpenses)}, net position {formatMoney(dayIncome - dayExpenses)}.</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'systems' && (
        <section className="panel">
          <div className="panel-header green"><h2 className="panel-title">Systems, Printers & Department Setup</h2></div>
          <div className="panel-body hospitality-section-body">
            <div className="anvi-ops-note">
              <strong>Recommended first setup:</strong> 7 working screens/computers, 3 thermal printers and 3 A4 printers are enough for a hotel with rooms, restaurant and banquet hall. Start lean, then add more kitchen KOT printers if rush increases.
            </div>
            <div className="table-scroll">
              <table className="history-table hospitality-table">
                <thead><tr><th>Area</th><th>Systems Needed</th><th>Operating System</th><th>Printer</th><th>Daily Use</th></tr></thead>
                <tbody>{systemPlan.map(([area, systems, os, printer, use]) => <tr key={area}><td><strong>{area}</strong></td><td>{systems}</td><td>{os}</td><td>{printer}</td><td>{use}</td></tr>)}</tbody>
              </table>
            </div>
            <div className="anvi-ops-grid">
              {osPlan.map(([title, os, detail]) => (
                <article className="panel hospitality-kpi anvi-ops-guide-card" key={title}>
                  <span>{title}</span>
                  <strong>{os}</strong>
                  <p>{detail}</p>
                </article>
              ))}
            </div>
            <div className="anvi-ops-grid">
              {printerPlan.map(([title, detail]) => (
                <article className="panel hospitality-kpi anvi-ops-guide-card" key={title}>
                  <span>{title}</span>
                  <strong>{detail}</strong>
                </article>
              ))}
            </div>
            <div className="anvi-ops-grid">
              <article className="panel anvi-ops-guide-card">
                <h3>Reception Flow</h3>
                <p>Enquiry, advance, room assignment, guest ID, check-in A4 form, room service posting, check-out final bill and balance collection must happen at reception.</p>
              </article>
              <article className="panel anvi-ops-guide-card">
                <h3>Restaurant Flow</h3>
                <p>Table number, server ID, food items, GST breakup, KOT, thermal bill and payment mode must be fast enough for rush hours.</p>
              </article>
              <article className="panel anvi-ops-guide-card">
                <h3>Banquet Flow</h3>
                <p>Hall availability, guest count, food package, decoration notes, payment milestones, function sheet, staff tasks and final A4 invoice should stay in one booking.</p>
              </article>
              <article className="panel anvi-ops-guide-card">
                <h3>Indian Hospitality Fit</h3>
                <p>Keep reception calm, print formats clean, advance/balance visible, food preferences clear and guest-facing notes respectful for family functions and business guests.</p>
              </article>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'software' && (
        <section className="panel">
          <div className="panel-header green"><h2 className="panel-title">Role Wise Operating Software</h2></div>
          <div className="panel-body hospitality-section-body">
            <div className="anvi-ops-note">
              Every department gets a simple screen: staff should see only their daily work, printer output, and alert action. Real automatic SMS/WhatsApp sending needs provider keys later; until then WhatsApp quick-send links and message templates are ready.
            </div>
            <div className="anvi-ops-grid role-scope-grid">
              {roleScopeCards.map(([title, work, printer]) => (
                <article className="panel anvi-ops-guide-card" key={title}>
                  <h3>{title}</h3>
                  <p>{work}</p>
                  <p><strong>{printer}</strong></p>
                </article>
              ))}
            </div>
            <div className="table-scroll">
              <table className="history-table hospitality-table">
                <thead><tr><th>System</th><th>Software Screen</th><th>Features</th><th>Scope Lock</th><th>Printer Output</th><th>Alerts</th><th>Open Work</th></tr></thead>
                <tbody>{operatingSoftwarePlan.map(([system, screen, features, output, alerts, scope]) => (
                  <tr key={system}>
                    <td><strong>{system}</strong></td>
                    <td>{screen}</td>
                    <td>{features}</td>
                    <td><span className="status-chip muted">{scope}</span></td>
                    <td>{output}</td>
                    <td>{alerts}</td>
                    <td><button className="secondary-button" type="button" onClick={() => startDepartmentTask(system.includes('Kitchen') ? 'KITCHEN' : system.includes('Dobi') ? 'DOBI' : system.includes('Housekeeping') ? 'HOUSEKEEPING' : system.includes('Security') ? 'SECURITY' : system.includes('Takeaway') ? 'TAKEAWAY' : system.includes('Store') ? 'STORE' : system.includes('Food') ? 'SERVER' : system.includes('Reception') ? 'RECEPTION' : system.includes('Accounts') ? 'ACCOUNTS' : 'MANAGER', `${screen} setup / daily work`)}>Task</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <div className="anvi-ops-grid">
              {alertTemplates.map(([name, channel, text]) => (
                <article className="panel anvi-ops-guide-card" key={name}>
                  <h3>{name}</h3>
                  <p><strong>{channel}</strong></p>
                  <p>{text}</p>
                  <button className="secondary-button" type="button" onClick={() => openWhatsAppAlert(text)}>WhatsApp Draft</button>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeSection === 'masters' && (
        <section className="panel">
          <div className="panel-header green"><h2 className="panel-title">Room, Banquet & Restaurant Masters</h2></div>
          <div className="panel-body hospitality-section-body">
            <div className="hospitality-tabs">{masterTabs.map(([key, label]) => <button key={key} className={`mode-pill ${activeMasterType === key ? 'active' : ''}`} type="button" onClick={() => { setActiveMasterType(key); setContentForm({ ...contentBlank, content_type: key }); }}>{label}</button>)}</div>
            <form className="hospitality-form-grid" onSubmit={handleMasterSave}>
              <Field label={activeMasterType === 'FOOD' ? 'Menu Item' : activeMasterType === 'ROOM' ? 'Room Name / Number' : 'Hall Name'}><input className="field" value={contentForm.title} onChange={(event) => setContentForm((current) => ({ ...current, title: event.target.value }))} required /></Field>
              <Field label={activeMasterType === 'FOOD' ? 'Rate' : 'Rent'}><input className="field" type="number" value={contentForm.price} onChange={(event) => setContentForm((current) => ({ ...current, price: event.target.value }))} /></Field>
              <Field label="Unit"><input className="field" value={contentForm.unit_label} onChange={(event) => setContentForm((current) => ({ ...current, unit_label: event.target.value }))} placeholder="night, event, plate, item" /></Field>
              <Field label="Capacity"><input className="field" type="number" value={contentForm.capacity || ''} onChange={(event) => setContentForm((current) => ({ ...current, capacity: event.target.value }))} /></Field>
              <Field label="Display Order"><input className="field" type="number" value={contentForm.display_order} onChange={(event) => setContentForm((current) => ({ ...current, display_order: event.target.value }))} /></Field>
              <label className="change-box hospitality-checkbox"><input type="checkbox" checked={Boolean(contentForm.is_active)} onChange={(event) => setContentForm((current) => ({ ...current, is_active: event.target.checked }))} /> Active</label>
              <Field label="Description / Inclusions"><textarea className="field" rows="2" value={contentForm.description} onChange={(event) => setContentForm((current) => ({ ...current, description: event.target.value }))} /></Field>
              <Field label="Photo / Reference"><input className="field" value={contentForm.image_url} onChange={(event) => setContentForm((current) => ({ ...current, image_url: event.target.value }))} placeholder="Optional image path or reference" /></Field>
              <button className="primary-button compact-primary" type="submit">{contentForm.id ? 'Update Master' : 'Add Master'}</button>
              <button className="secondary-button" type="button" onClick={() => setContentForm({ ...contentBlank, content_type: activeMasterType })}>Clear</button>
            </form>
            <div className="table-scroll"><table className="history-table hospitality-table"><thead><tr><th>Name</th><th>Rate</th><th>Capacity</th><th>Status</th><th>Description</th><th>Actions</th></tr></thead><tbody>{masterRows.length === 0 ? <tr><td colSpan="6">No master records yet.</td></tr> : masterRows.map((row) => <tr key={row.id}><td><strong>{row.title}</strong><span className="muted">{row.unit_label}</span></td><td>{formatMoney(row.price)}</td><td>{row.capacity || '-'}</td><td>{row.is_active ? 'Active' : 'Inactive'}</td><td>{row.description || '-'}</td><td><div className="table-actions"><button className="secondary-button" type="button" onClick={() => editMaster(row)}>Edit</button><button className="danger-button" type="button" onClick={() => handleMasterDelete(row)}>Delete</button></div></td></tr>)}</tbody></table></div>
          </div>
        </section>
      )}

      {activeSection === 'restaurant' && (
        <section className="hospitality-two-column">
          <div className="panel">
            <div className="panel-header green"><h2 className="panel-title">Restaurant / Store Inward & Outward</h2></div>
            <div className="panel-body hospitality-section-body">
              <form className="hospitality-form-grid compact" onSubmit={handleStockSave}>
                <Field label="Date"><input className="field" type="date" value={stockForm.movement_date} onChange={(event) => setStockForm((current) => ({ ...current, movement_date: event.target.value }))} /></Field>
                <Field label="Direction"><select className="select" value={stockForm.direction} onChange={(event) => setStockForm((current) => ({ ...current, direction: event.target.value }))}><option value="INWARD">INWARD</option><option value="OUTWARD">OUTWARD</option></select></Field>
                <Field label="Item"><input className="field" value={stockForm.item_name} onChange={(event) => setStockForm((current) => ({ ...current, item_name: event.target.value }))} required /></Field>
                <Field label="Supplier / Section"><input className="field" value={stockForm.supplier_name} onChange={(event) => setStockForm((current) => ({ ...current, supplier_name: event.target.value }))} /></Field>
                <Field label="Qty"><input className="field" type="number" value={stockForm.quantity} onChange={(event) => setStockForm((current) => ({ ...current, quantity: event.target.value }))} /></Field>
                <Field label="Unit"><input className="field" value={stockForm.unit_label} onChange={(event) => setStockForm((current) => ({ ...current, unit_label: event.target.value }))} /></Field>
                <Field label="Amount"><input className="field" type="number" value={stockForm.amount} onChange={(event) => setStockForm((current) => ({ ...current, amount: event.target.value }))} /></Field>
                <Field label="Purpose"><input className="field" value={stockForm.purpose} onChange={(event) => setStockForm((current) => ({ ...current, purpose: event.target.value }))} /></Field>
                <button className="primary-button compact-primary" type="submit">{stockForm.id ? 'Update Movement' : 'Save Movement'}</button>
                <button className="secondary-button" type="button" onClick={() => setStockForm(stockBlank)}>Clear</button>
              </form>
              <table className="history-table hospitality-table"><thead><tr><th>Date</th><th>Type</th><th>Item</th><th>Qty</th><th>Amount</th><th>Edit</th></tr></thead><tbody>{stockRows.length === 0 ? <tr><td colSpan="6">No store movements.</td></tr> : stockRows.map((row) => <tr key={row.id}><td>{row.movement_date}</td><td>{row.direction}</td><td>{row.item_name}<span className="muted">{row.supplier_name}</span></td><td>{Number(row.quantity || 0)} {row.unit_label}</td><td>{formatMoney(row.amount)}</td><td><button className="secondary-button" type="button" onClick={() => editStock(row)}>Edit</button></td></tr>)}</tbody></table>
            </div>
          </div>
          <div className="panel"><div className="panel-header green"><h2 className="panel-title">Restaurant Quick Controls</h2></div><div className="panel-body hospitality-section-body anvi-stack-actions"><button type="button" className="primary-button compact-primary" onClick={() => startBooking('FOOD')}>Create Food Order</button><button type="button" className="secondary-button" onClick={() => { setActiveSection('masters'); setActiveMasterType('FOOD'); }}>Maintain Menu</button><button type="button" className="secondary-button" onClick={() => { setActiveSection('tasks'); setTaskForm({ ...taskBlank, area: 'KITCHEN' }); }}>Kitchen Task</button><button type="button" className="secondary-button" onClick={() => setStockForm({ ...stockBlank, direction: 'INWARD' })}>New Inward</button><button type="button" className="secondary-button" onClick={() => setStockForm({ ...stockBlank, direction: 'OUTWARD' })}>New Outward</button></div></div>
        </section>
      )}

      {activeSection === 'restaurantOps' && (
        <section className="panel">
          <div className="panel-header green"><h2 className="panel-title">Restaurant Orders, Kitchen View & Dispatch</h2></div>
          <div className="panel-body hospitality-section-body">
            <div className="anvi-ops-note">
              Customer order, table, waiter, supplier/server, kitchen status, dispatch and thermal bill are managed from the same food booking record.
            </div>
            <div className="anvi-quick-actions">
              <button className="primary-button compact-primary" type="button" onClick={() => startBooking('FOOD')}>New Table / Takeaway Order</button>
              <button className="secondary-button" type="button" onClick={() => { setActiveSection('tasks'); setTaskForm({ ...taskBlank, area: 'KITCHEN', title: 'Kitchen KOT follow-up' }); }}>Kitchen Task</button>
              <button className="secondary-button" type="button" onClick={() => { setActiveSection('tasks'); setTaskForm({ ...taskBlank, area: 'TAKEAWAY', title: 'Takeaway dispatch follow-up' }); }}>Dispatch Task</button>
            </div>
            <div className="table-scroll">
              <table className="history-table hospitality-table">
                <thead><tr><th>Date</th><th>Table/Token</th><th>Customer</th><th>Order</th><th>Waiter</th><th>Supplier</th><th>Kitchen</th><th>Delivery</th><th>Bill</th><th>Actions</th></tr></thead>
                <tbody>{bookings.filter((row) => row.booking_type === 'FOOD').length === 0 ? <tr><td colSpan="10">No restaurant orders in selected date.</td></tr> : bookings.filter((row) => row.booking_type === 'FOOD').map((row) => (
                  <tr key={row.id}>
                    <td>{row.booking_date}<span className="muted">{row.time_slot}</span></td>
                    <td>{row.table_number || '-'}</td>
                    <td>{row.customer_name}<span className="muted">{row.customer_phone}</span></td>
                    <td>{row.food_details || row.item_title || '-'}</td>
                    <td>{row.waiter_name || row.server_id || '-'}</td>
                    <td>{row.supplier_name || '-'}</td>
                    <td><span className="status-chip info">{row.order_status || 'NEW'}</span></td>
                    <td>{row.delivery_status || '-'}<span className="muted">{row.dispatch_details || ''}</span></td>
                    <td>{formatMoney(row.total_amount)}<span className="muted">GST {formatMoney(row.gst_amount)}</span></td>
                    <td><div className="table-actions"><button className="secondary-button" type="button" onClick={() => editBooking(row)}>Edit</button><button className="secondary-button" type="button" onClick={() => printBooking(row, 'Kitchen KOT', 'THERMAL')}>KOT Thermal</button><button className="secondary-button" type="button" onClick={() => printBooking(row, 'Food Bill', 'THERMAL')}>Bill Thermal</button></div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'people' && (
        <section className="hospitality-two-column">
          <div className="panel">
            <div className="panel-header green"><h2 className="panel-title">Manager, Security & Staff Details</h2></div>
            <div className="panel-body hospitality-section-body">
              <form className="hospitality-form-grid compact" onSubmit={handleStaffSave}>
                <Field label="Staff Name"><input className="field" value={staffForm.staff_name} onChange={(event) => setStaffForm((current) => ({ ...current, staff_name: event.target.value }))} required /></Field>
                <Field label="Role"><select className="select" value={staffForm.role} onChange={(event) => setStaffForm((current) => ({ ...current, role: event.target.value }))}>{staffRoles.map((role) => <option key={role} value={role}>{role}</option>)}</select></Field>
                <Field label="Phone"><input className="field" value={staffForm.phone} onChange={(event) => setStaffForm((current) => ({ ...current, phone: event.target.value }))} /></Field>
                <Field label="Shift"><input className="field" value={staffForm.shift_label} onChange={(event) => setStaffForm((current) => ({ ...current, shift_label: event.target.value }))} placeholder="Morning / Evening / Night" /></Field>
                <Field label="Address"><textarea className="field" rows="2" value={staffForm.address} onChange={(event) => setStaffForm((current) => ({ ...current, address: event.target.value }))} /></Field>
                <label className="change-box hospitality-checkbox"><input type="checkbox" checked={Boolean(staffForm.is_active)} onChange={(event) => setStaffForm((current) => ({ ...current, is_active: event.target.checked }))} /> Active</label>
                <button className="primary-button compact-primary" type="submit">{staffForm.id ? 'Update Staff' : 'Save Staff'}</button>
                <button className="secondary-button" type="button" onClick={() => setStaffForm(staffBlank)}>Clear</button>
              </form>
              <table className="history-table hospitality-table"><thead><tr><th>Name</th><th>Role</th><th>Phone</th><th>Shift</th><th>Status</th><th>Edit</th></tr></thead><tbody>{staffRows.length === 0 ? <tr><td colSpan="6">No staff saved.</td></tr> : staffRows.map((row) => <tr key={row.id}><td>{row.staff_name}<span className="muted">{row.address}</span></td><td>{row.role}</td><td>{row.phone || '-'}</td><td>{row.shift_label || '-'}</td><td>{row.is_active ? 'Active' : 'Inactive'}</td><td><button className="secondary-button" type="button" onClick={() => editStaff(row)}>Edit</button></td></tr>)}</tbody></table>
            </div>
          </div>
          <div className="panel">
            <div className="panel-header green"><h2 className="panel-title">Attendance & Walk-in Customers</h2></div>
            <div className="panel-body hospitality-section-body">
              <form className="hospitality-form-grid compact" onSubmit={handleAttendanceSave}>
                <Field label="Date"><input className="field" type="date" value={attendanceForm.attendance_date} onChange={(event) => setAttendanceForm((current) => ({ ...current, attendance_date: event.target.value }))} /></Field>
                <Field label="Name"><input className="field" value={attendanceForm.staff_name} onChange={(event) => setAttendanceForm((current) => ({ ...current, staff_name: event.target.value }))} required /></Field>
                <Field label="Role"><select className="select" value={attendanceForm.role} onChange={(event) => setAttendanceForm((current) => ({ ...current, role: event.target.value }))}>{staffRoles.map((role) => <option key={role} value={role}>{role}</option>)}</select></Field>
                <Field label="Status"><select className="select" value={attendanceForm.status} onChange={(event) => setAttendanceForm((current) => ({ ...current, status: event.target.value }))}>{attendanceStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></Field>
                <Field label="In"><input className="field" value={attendanceForm.check_in} onChange={(event) => setAttendanceForm((current) => ({ ...current, check_in: event.target.value }))} placeholder="09:00" /></Field>
                <Field label="Out"><input className="field" value={attendanceForm.check_out} onChange={(event) => setAttendanceForm((current) => ({ ...current, check_out: event.target.value }))} placeholder="18:00" /></Field>
                <button className="primary-button compact-primary" type="submit">Save Attendance</button>
              </form>
              <form className="hospitality-form-grid compact" onSubmit={handleWalkinSave}>
                <Field label="Visit Date"><input className="field" type="date" value={walkinForm.visit_date} onChange={(event) => setWalkinForm((current) => ({ ...current, visit_date: event.target.value }))} /></Field>
                <Field label="Customer Name"><input className="field" value={walkinForm.customer_name} onChange={(event) => setWalkinForm((current) => ({ ...current, customer_name: event.target.value }))} required /></Field>
                <Field label="Phone"><input className="field" value={walkinForm.customer_phone} onChange={(event) => setWalkinForm((current) => ({ ...current, customer_phone: event.target.value }))} required /></Field>
                <Field label="Purpose"><input className="field" value={walkinForm.purpose} onChange={(event) => setWalkinForm((current) => ({ ...current, purpose: event.target.value }))} placeholder="Room enquiry / Party hall / Restaurant" /></Field>
                <button className="primary-button compact-primary" type="submit">Save Walk-in</button>
              </form>
              <table className="history-table hospitality-table"><thead><tr><th>Date</th><th>Customer</th><th>Purpose</th><th>Visits</th></tr></thead><tbody>{walkinRows.length === 0 ? <tr><td colSpan="4">No walk-ins.</td></tr> : walkinRows.map((row) => <tr key={row.id}><td>{row.visit_date}</td><td>{row.customer_name}<span className="muted">{row.customer_phone}</span></td><td>{row.purpose || '-'}</td><td>{row.visit_count}</td></tr>)}</tbody></table>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'tasks' && (
        <section className="panel">
          <div className="panel-header green"><h2 className="panel-title">Hotel, Restaurant & Maintenance Tasks</h2></div>
          <div className="panel-body hospitality-section-body">
            <form className="hospitality-form-grid" onSubmit={handleTaskSave}>
              <Field label="Date"><input className="field" type="date" value={taskForm.task_date} onChange={(event) => setTaskForm((current) => ({ ...current, task_date: event.target.value }))} /></Field>
              <Field label="Section"><select className="select" value={taskForm.area} onChange={(event) => setTaskForm((current) => ({ ...current, area: event.target.value }))}>{taskAreas.map((area) => <option key={area} value={area}>{area}</option>)}</select></Field>
              <Field label="Task"><input className="field" value={taskForm.title} onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))} required /></Field>
              <Field label="Assigned To"><input className="field" value={taskForm.assigned_to} onChange={(event) => setTaskForm((current) => ({ ...current, assigned_to: event.target.value }))} /></Field>
              <Field label="Amount / Cost"><input className="field" type="number" value={taskForm.amount} onChange={(event) => setTaskForm((current) => ({ ...current, amount: event.target.value }))} /></Field>
              <Field label="Status"><select className="select" value={taskForm.status} onChange={(event) => setTaskForm((current) => ({ ...current, status: event.target.value }))}>{taskStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></Field>
              <Field label="Notes"><textarea className="field" rows="2" value={taskForm.notes} onChange={(event) => setTaskForm((current) => ({ ...current, notes: event.target.value }))} /></Field>
              <button className="primary-button compact-primary" type="submit">{taskForm.id ? 'Update Task' : 'Save Task'}</button>
              <button className="secondary-button" type="button" onClick={() => setTaskForm(taskBlank)}>Clear</button>
            </form>
            <table className="history-table hospitality-table"><thead><tr><th>Date</th><th>Area</th><th>Task</th><th>Assigned</th><th>Cost</th><th>Status</th><th>Edit</th></tr></thead><tbody>{tasks.length === 0 ? <tr><td colSpan="7">No tasks.</td></tr> : tasks.map((row) => <tr key={row.id}><td>{row.task_date}</td><td>{row.area}</td><td>{row.title}<span className="muted">{row.notes}</span></td><td>{row.assigned_to || '-'}</td><td>{formatMoney(row.amount)}</td><td>{row.status}</td><td><button className="secondary-button" type="button" onClick={() => editTask(row)}>Edit</button></td></tr>)}</tbody></table>
          </div>
        </section>
      )}

      {activeSection === 'settings' && (
        <section className="panel">
          <div className="panel-header green"><h2 className="panel-title">Hotel Contact & Department Settings</h2></div>
          <div className="panel-body hospitality-section-body">
            <form className="hospitality-form-grid" onSubmit={handleProfileSave}>
              <Field label="Hotel Name"><input className="field" value={profileForm.hotel_name} onChange={(event) => setProfileForm((current) => ({ ...current, hotel_name: event.target.value }))} /></Field>
              <Field label="Restaurant Name"><input className="field" value={profileForm.restaurant_name} onChange={(event) => setProfileForm((current) => ({ ...current, restaurant_name: event.target.value }))} /></Field>
              <Field label="Email"><input className="field" type="email" value={profileForm.email} onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))} /></Field>
              <Field label="Main Phone"><input className="field" value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} /></Field>
              <Field label="Admin Number"><input className="field" value={profileForm.admin_phone} onChange={(event) => setProfileForm((current) => ({ ...current, admin_phone: event.target.value }))} /></Field>
              <Field label="Reception Number"><input className="field" value={profileForm.reception_phone} onChange={(event) => setProfileForm((current) => ({ ...current, reception_phone: event.target.value }))} /></Field>
              <Field label="Restaurant Number"><input className="field" value={profileForm.restaurant_phone} onChange={(event) => setProfileForm((current) => ({ ...current, restaurant_phone: event.target.value }))} /></Field>
              <Field label="Address"><textarea className="field" rows="2" value={profileForm.address} onChange={(event) => setProfileForm((current) => ({ ...current, address: event.target.value }))} /></Field>
              <button className="primary-button compact-primary" type="submit">Save Settings</button>
              <button className="secondary-button" type="button" onClick={() => setProfileForm(profileBlank)}>Reset Defaults</button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
