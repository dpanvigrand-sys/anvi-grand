import React, { useEffect, useMemo, useState } from 'react';
import {
  deleteHospitalityContent,
  fetchHospitalityBookings,
  fetchHospitalityContent,
  fetchHospitalityProfile,
  fetchHospitalityStockMovements,
  fetchHospitalitySummary,
  fetchHospitalityTasks,
  saveHospitalityBooking,
  saveHospitalityContent,
  saveHospitalityProfile,
  saveHospitalityStockMovement,
  saveHospitalityTask
} from '../api/client';

const today = () => new Date().toISOString().slice(0, 10);

const bookingTypes = ['ALL', 'ROOM', 'BANQUET', 'FOOD'];
const bookingStatuses = ['ENQUIRY', 'ADVANCE', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'];
const taskAreas = ['RECEPTION', 'KITCHEN', 'MANAGER', 'SERVER', 'SUPPLIER', 'STORE', 'HOUSEKEEPING', 'LAUNDRY', 'ACCOUNTS'];
const taskStatuses = ['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED'];
const masterTabs = [['ROOM', 'Rooms'], ['BANQUET', 'Banquet Halls'], ['FOOD', 'Restaurant Menu']];

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
  guest_count: '',
  food_plan: 'WITHOUT_FOOD',
  food_details: '',
  complimentary_breakfast: '',
  total_amount: '',
  advance_amount: '',
  payment_mode: 'Cash',
  status: 'ENQUIRY',
  notes: ''
};
const taskBlank = { id: null, task_date: today(), area: 'RECEPTION', title: '', assigned_to: '', amount: '', status: 'OPEN', notes: '' };
const stockBlank = { id: null, movement_date: today(), direction: 'INWARD', item_name: '', supplier_name: '', quantity: '', unit_label: '', amount: '', purpose: '', notes: '' };
const profileBlank = {
  hotel_name: 'ANVI GRAND',
  restaurant_name: 'CHIGURU',
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

export default function HospitalityView() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeMasterType, setActiveMasterType] = useState('ROOM');
  const [summary, setSummary] = useState(null);
  const [masterRows, setMasterRows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stockRows, setStockRows] = useState([]);
  const [contentForm, setContentForm] = useState(contentBlank);
  const [bookingForm, setBookingForm] = useState(bookingBlank);
  const [taskForm, setTaskForm] = useState(taskBlank);
  const [stockForm, setStockForm] = useState(stockBlank);
  const [profileForm, setProfileForm] = useState(profileBlank);
  const [filters, setFilters] = useState({ from: today(), to: today(), bookingType: 'ALL' });
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => { loadSummary(); }, []);
  useEffect(() => { loadMaster(activeMasterType); }, [activeMasterType]);
  useEffect(() => { loadWork(); }, [filters.from, filters.to, filters.bookingType]);

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

  async function loadWork() {
    try {
      const [bookingRows, taskRows, movementRows] = await Promise.all([
        fetchHospitalityBookings({ from: filters.from, to: filters.to, type: filters.bookingType }),
        fetchHospitalityTasks({ from: filters.from, to: filters.to }),
        fetchHospitalityStockMovements({ from: filters.from, to: filters.to })
      ]);
      setBookings(bookingRows);
      setTasks(taskRows);
      setStockRows(movementRows);
    } catch (_err) {
      setErrorMessage('Unable to load operations data.');
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
      await Promise.all([loadMaster(activeMasterType), loadSummary()]);
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
      await loadMaster(activeMasterType);
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
      await Promise.all([loadWork(), loadSummary()]);
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
    ['masters', 'Rooms / Halls / Menu'],
    ['restaurant', 'Restaurant Store'],
    ['tasks', 'Maintenance Tasks'],
    ['settings', 'Hotel Settings']
  ];

  const recentRows = bookings.slice(0, 5);
  const pendingTasks = tasks.filter((row) => ['OPEN', 'IN_PROGRESS'].includes(row.status)).slice(0, 6);

  return (
    <div className="hospitality-view anvi-ops-app">
      <section className="hospitality-hero panel">
        <div>
          <span className="hospitality-eyebrow">ANVI GRAND Operations App</span>
          <h1>Rooms, Banquet & Restaurant Control</h1>
          <p>{profileForm.address}. Reception: {profileForm.reception_phone || profileForm.phone}. Restaurant: {profileForm.restaurant_phone || profileForm.phone}.</p>
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
            <form className="hospitality-form-grid" onSubmit={handleBookingSave}>
              <Field label="Booking Type"><select className="select" value={bookingForm.booking_type} onChange={(event) => setBookingForm((current) => ({ ...current, booking_type: event.target.value }))}>{bookingTypes.filter((type) => type !== 'ALL').map((type) => <option key={type} value={type}>{bookingLabel(type)}</option>)}</select></Field>
              <Field label="Date From"><input className="field" type="date" value={bookingForm.booking_date} onChange={(event) => setBookingForm((current) => ({ ...current, booking_date: event.target.value, end_date: current.end_date || event.target.value }))} /></Field>
              <Field label="Date To"><input className="field" type="date" value={bookingForm.end_date || bookingForm.booking_date} onChange={(event) => setBookingForm((current) => ({ ...current, end_date: event.target.value }))} /></Field>
              <Field label="Slot / Time"><input className="field" value={bookingForm.time_slot} onChange={(event) => setBookingForm((current) => ({ ...current, time_slot: event.target.value }))} placeholder="Check-in / Lunch / Evening / Full day" /></Field>
              <Field label="Customer Name"><input className="field" value={bookingForm.customer_name} onChange={(event) => setBookingForm((current) => ({ ...current, customer_name: event.target.value }))} required /></Field>
              <Field label="Phone"><input className="field" value={bookingForm.customer_phone} onChange={(event) => setBookingForm((current) => ({ ...current, customer_phone: event.target.value }))} required /></Field>
              <Field label="Room / Hall / Food Item"><input className="field" value={bookingForm.item_title} onChange={(event) => setBookingForm((current) => ({ ...current, item_title: event.target.value }))} /></Field>
              <Field label="Persons / Guests"><input className="field" type="number" value={bookingForm.guest_count} onChange={(event) => setBookingForm((current) => ({ ...current, guest_count: event.target.value }))} /></Field>
              <Field label="Food Plan"><select className="select" value={bookingForm.food_plan || 'WITHOUT_FOOD'} onChange={(event) => setBookingForm((current) => ({ ...current, food_plan: event.target.value }))}><option value="WITHOUT_FOOD">Without Food</option><option value="WITH_FOOD">With Food</option></select></Field>
              <Field label="Total Amount"><input className="field" type="number" value={bookingForm.total_amount} onChange={(event) => setBookingForm((current) => ({ ...current, total_amount: event.target.value }))} /></Field>
              <Field label="Advance"><input className="field" type="number" value={bookingForm.advance_amount} onChange={(event) => setBookingForm((current) => ({ ...current, advance_amount: event.target.value }))} /></Field>
              <Field label="Payment Mode"><input className="field" value={bookingForm.payment_mode} onChange={(event) => setBookingForm((current) => ({ ...current, payment_mode: event.target.value }))} placeholder="Cash / UPI / Card" /></Field>
              <Field label="Status"><select className="select" value={bookingForm.status} onChange={(event) => setBookingForm((current) => ({ ...current, status: event.target.value }))}>{bookingStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></Field>
              <Field label="Address"><textarea className="field" rows="2" value={bookingForm.customer_address} onChange={(event) => setBookingForm((current) => ({ ...current, customer_address: event.target.value }))} /></Field>
              <Field label="Food / Decoration Details"><textarea className="field" rows="2" value={bookingForm.food_details || ''} onChange={(event) => setBookingForm((current) => ({ ...current, food_details: event.target.value }))} /></Field>
              <Field label="Room Breakfast / Notes"><textarea className="field" rows="2" value={bookingForm.complimentary_breakfast || ''} onChange={(event) => setBookingForm((current) => ({ ...current, complimentary_breakfast: event.target.value }))} /></Field>
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
                <thead><tr><th>Dates</th><th>Type</th><th>Customer</th><th>Item</th><th>Food / Notes</th><th>Total</th><th>Advance</th><th>Balance</th><th>Status</th><th>Edit</th></tr></thead>
                <tbody>{bookings.length === 0 ? <tr><td colSpan="10">No bookings in selected dates.</td></tr> : bookings.map((row) => (
                  <tr key={row.id}><td>{row.booking_date}{row.end_date && row.end_date !== row.booking_date ? ` to ${row.end_date}` : ''}<span className="muted">{row.time_slot || ''}</span></td><td>{bookingLabel(row.booking_type)}</td><td><strong>{row.customer_name}</strong><span className="muted">{row.customer_phone}</span></td><td>{row.item_title || '-'}</td><td>{row.food_plan === 'WITH_FOOD' ? 'With Food' : 'Without Food'}<span className="muted">{row.food_details || row.complimentary_breakfast || row.notes || ''}</span></td><td>{formatMoney(row.total_amount)}</td><td>{formatMoney(row.advance_amount)}</td><td>{formatMoney(row.balance_amount)}</td><td><span className="status-chip info">{row.status}</span></td><td><button className="secondary-button" type="button" onClick={() => editBooking(row)}>Edit</button></td></tr>
                ))}</tbody>
              </table>
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
