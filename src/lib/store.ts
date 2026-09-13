import { promises as fs } from "fs";
import { unstable_noStore as noStore } from "next/cache";
import path from "path";
import { nightsBetween, uid } from "./format";
import type {
  BuffetBooking,
  HotelInfo,
  Catalog,
  ContactMessage,
  DayBookEntry,
  DiningTable,
  FoodOrder,
  FoodOrderItem,
  KitchenTicket,
  LedgerEntry,
  MusterEntry,
  OpsStore,
  PurchaseEntry,
  PurchaseType,
  RoomBooking,
  SalaryEntry,
  StockMove,
  VenueBooking,
} from "./types";

const dataDir = path.join(process.cwd(), "data");

const emptyOps: OpsStore = {
  roomBookings: [],
  venueBookings: [],
  foodOrders: [],
  buffetBookings: [],
  messages: [],
  tables: [],
  kitchenTickets: [],
  ledger: [],
  dayBook: [],
  muster: [],
  salaries: [],
  purchases: [],
  inward: [],
  outward: [],
  guests: [],
};

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(dataDir, file), "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(file: string, data: T): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(path.join(dataDir, file), JSON.stringify(data, null, 2), "utf8");
}

async function getOpsStore(): Promise<OpsStore> {
  const raw = await readJson<Partial<OpsStore>>("ops.json", emptyOps);
  return {
    ...emptyOps,
    ...raw,
    roomBookings: raw.roomBookings ?? [],
    venueBookings: raw.venueBookings ?? [],
    foodOrders: raw.foodOrders ?? [],
    buffetBookings: raw.buffetBookings ?? [],
    messages: raw.messages ?? [],
    tables: raw.tables ?? [],
    kitchenTickets: raw.kitchenTickets ?? [],
    ledger: raw.ledger ?? [],
    dayBook: raw.dayBook ?? [],
    muster: raw.muster ?? [],
    salaries: raw.salaries ?? [],
    purchases: raw.purchases ?? [],
    inward: raw.inward ?? [],
    outward: raw.outward ?? [],
    guests: raw.guests ?? [],
  };
}

async function saveOps(ops: OpsStore): Promise<void> {
  await writeJson("ops.json", ops);
}

export async function getCatalog(): Promise<Catalog> {
  noStore();
  return readJson<Catalog>("catalog.json", {
    hotel: {
      name: "ANVI GRAND",
      tagline: "Grand stays on Eluru Road",
      address: "Anvi Grand, near Benz Circle, Eluru Road, Vijayawada",
      phone: "7569494949",
      email: "stay@anvigrand.in",
      foodBrand: "CHIGURU",
    },
    rooms: [],
    venues: [],
    menu: [],
    buffets: [],
    facilities: [],
  });
}

export async function getHotel() {
  return (await getCatalog()).hotel;
}

/** Role phones with fallback to legacy hotel.phone */
export function resolveHotelPhones(hotel: HotelInfo) {
  const fallback = hotel.phone?.trim() || "7569494949";
  return {
    rooms: hotel.roomsPhone?.trim() || fallback,
    food: hotel.foodPhone?.trim() || fallback,
    reception: hotel.receptionPhone?.trim() || fallback,
    main: fallback,
  };
}

export async function getRooms() {
  return (await getCatalog()).rooms;
}

export async function getRoom(id: string) {
  return (await getRooms()).find((r) => r.id === id);
}

export async function getVenues(type?: "banquet" | "party-hall") {
  const { resolveVenueImage } = await import("./default-images");
  const all = (await getCatalog()).venues.map((v) => ({
    ...v,
    image: resolveVenueImage(v.id, v.image),
  }));
  return type ? all.filter((v) => v.type === type) : all;
}

export async function getVenue(id: string) {
  return (await getVenues()).find((v) => v.id === id);
}

export async function getMenu() {
  return (await getCatalog()).menu;
}

export async function getBuffets() {
  return (await getCatalog()).buffets;
}

export async function getFacilities() {
  return (await getCatalog()).facilities;
}

export async function getOps(): Promise<OpsStore> {
  return getOpsStore();
}

export async function createRoomBooking(input: {
  roomId: string;
  guestName: string;
  email: string;
  phone: string;
  address?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  notes?: string;
  advance?: number;
}): Promise<{ booking?: RoomBooking; error?: string }> {
  const room = await getRoom(input.roomId);
  if (!room) return { error: "Room not found." };
  if (!room.available) return { error: "Room unavailable." };
  if (!input.guestName?.trim() || !input.email?.trim() || !input.phone?.trim()) {
    return { error: "Name, email, and phone are required." };
  }
  const nights = nightsBetween(input.checkIn, input.checkOut);
  if (nights < 1) return { error: "Check-out must be after check-in." };
  if (input.guests < 1 || input.guests > room.capacity) {
    return { error: `Guests must be 1–${room.capacity}.` };
  }

  const total = nights * room.pricePerNight;
  const advance = Math.max(0, Math.min(total, Number(input.advance) || 0));
  const booking: RoomBooking = {
    id: uid("ag"),
    type: "room",
    roomId: room.id,
    roomName: room.name,
    guestName: input.guestName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    address: input.address?.trim() || undefined,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guests: input.guests,
    nights,
    total,
    advance,
    balance: Math.max(0, total - advance),
    notes: input.notes?.trim() || undefined,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  const ops = await getOpsStore();
  ops.roomBookings.unshift(booking);
  ops.ledger.unshift({
    id: uid("led"),
    kind: "income",
    category: "room",
    description: `${booking.roomName} · ${booking.guestName}`,
    amount: booking.total,
    refId: booking.id,
    createdAt: booking.createdAt,
  });
  ops.guests.unshift({
    id: uid("gst"),
    name: booking.guestName,
    phone: booking.phone,
    roomId: booking.roomId,
    status: "booked",
  });
  await saveOps(ops);
  return { booking };
}

export async function createVenueBooking(input: {
  venueId: string;
  guestName: string;
  email: string;
  phone: string;
  eventDate: string;
  guests: number;
  notes?: string;
}): Promise<{ booking?: VenueBooking; error?: string }> {
  const venue = await getVenue(input.venueId);
  if (!venue) return { error: "Venue not found." };
  if (!input.guestName?.trim() || !input.phone?.trim() || !input.eventDate) {
    return { error: "Name, phone, and event date are required." };
  }
  if (input.guests < 1 || input.guests > venue.capacity) {
    return { error: `Guests must be 1–${venue.capacity}.` };
  }

  const booking: VenueBooking = {
    id: uid("vn"),
    type: venue.type,
    venueId: venue.id,
    venueName: venue.name,
    guestName: input.guestName.trim(),
    email: (input.email || "").trim().toLowerCase(),
    phone: input.phone.trim(),
    eventDate: input.eventDate,
    guests: input.guests,
    total: venue.priceFrom,
    notes: input.notes?.trim() || undefined,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  const ops = await getOpsStore();
  ops.venueBookings.unshift(booking);
  ops.ledger.unshift({
    id: uid("led"),
    kind: "income",
    category: venue.type,
    description: `${booking.venueName} · ${booking.guestName}`,
    amount: booking.total,
    refId: booking.id,
    createdAt: booking.createdAt,
  });
  await saveOps(ops);
  return { booking };
}

export async function createFoodOrder(input: {
  guestName: string;
  phone: string;
  address?: string;
  roomNumber?: string;
  tableId?: string;
  source?: FoodOrder["source"];
  items: { menuId: string; qty: number }[];
  advance?: number;
}): Promise<{ order?: FoodOrder; error?: string }> {
  if (!input.guestName?.trim() || !input.phone?.trim()) {
    return { error: "Name and phone are required." };
  }
  if (!input.items?.length) return { error: "Add at least one item." };

  const menu = await getMenu();
  const lines: FoodOrderItem[] = [];
  for (const item of input.items) {
    const dish = menu.find((m) => m.id === item.menuId);
    if (!dish || item.qty < 1) continue;
    lines.push({ menuId: dish.id, name: dish.name, qty: item.qty, price: dish.price });
  }
  if (!lines.length) return { error: "No valid menu items." };

  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const advance = Math.max(0, Math.min(total, Number(input.advance) || 0));
  const createdAt = new Date().toISOString();
  const order: FoodOrder = {
    id: uid("fo"),
    type: "food",
    guestName: input.guestName.trim(),
    phone: input.phone.trim(),
    address: input.address?.trim() || undefined,
    roomNumber: input.roomNumber?.trim() || undefined,
    items: lines,
    total,
    advance,
    balance: Math.max(0, total - advance),
    status: "placed",
    source: input.source ?? "online",
    tableId: input.tableId,
    createdAt,
  };

  const ticket: KitchenTicket = {
    id: uid("kt"),
    orderId: order.id,
    items: lines,
    tableId: input.tableId,
    status: "queued",
    createdAt,
    updatedAt: createdAt,
  };

  const ops = await getOpsStore();
  ops.foodOrders.unshift(order);
  ops.kitchenTickets.unshift(ticket);
  if (input.tableId) {
    ops.tables = ops.tables.map((t) =>
      t.id === input.tableId ? { ...t, status: "occupied" as const } : t,
    );
  }
  ops.ledger.unshift({
    id: uid("led"),
    kind: "income",
    category: "food",
    description: `CHIGURU · ${order.guestName}`,
    amount: total,
    refId: order.id,
    createdAt,
  });
  await saveOps(ops);
  return { order };
}

export async function createBuffetBooking(input: {
  buffetId: string;
  guestName: string;
  phone: string;
  date: string;
  guests: number;
}): Promise<{ booking?: BuffetBooking; error?: string }> {
  const buffet = (await getBuffets()).find((b) => b.id === input.buffetId);
  if (!buffet) return { error: "Buffet not found." };
  if (!input.guestName?.trim() || !input.phone?.trim() || !input.date) {
    return { error: "Name, phone, and date are required." };
  }
  if (input.guests < 1) return { error: "At least one guest required." };

  const booking: BuffetBooking = {
    id: uid("bf"),
    type: "buffet",
    buffetId: buffet.id,
    buffetName: buffet.name,
    guestName: input.guestName.trim(),
    phone: input.phone.trim(),
    date: input.date,
    guests: input.guests,
    total: input.guests * buffet.pricePerPerson,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  const ops = await getOpsStore();
  ops.buffetBookings.unshift(booking);
  ops.ledger.unshift({
    id: uid("led"),
    kind: "income",
    category: "buffet",
    description: `${booking.buffetName} · ${booking.guestName}`,
    amount: booking.total,
    refId: booking.id,
    createdAt: booking.createdAt,
  });
  await saveOps(ops);
  return { booking };
}

export async function createContactMessage(input: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<{ message?: ContactMessage; error?: string }> {
  if (!input.name?.trim() || !input.email?.trim() || !input.message?.trim()) {
    return { error: "Name, email, and message are required." };
  }
  const message: ContactMessage = {
    id: uid("msg"),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim(),
    subject: input.subject?.trim() || "General inquiry",
    message: input.message.trim(),
    createdAt: new Date().toISOString(),
  };
  const ops = await getOpsStore();
  ops.messages.unshift(message);
  await saveOps(ops);
  return { message };
}

export async function updateRoomBookingStatus(id: string, status: RoomBooking["status"]) {
  const ops = await getOpsStore();
  const i = ops.roomBookings.findIndex((b) => b.id === id);
  if (i < 0) return { error: "Booking not found." };
  ops.roomBookings[i] = { ...ops.roomBookings[i], status };
  await saveOps(ops);
  return { booking: ops.roomBookings[i] };
}

/** Patch guest / payment fields on a room booking or food order. */
export async function updateBookingRecord(
  id: string,
  patch: {
    address?: string;
    phone?: string;
    guestName?: string;
    advance?: number;
    balance?: number;
  },
): Promise<{ booking?: RoomBooking; order?: FoodOrder; error?: string }> {
  const ops = await getOpsStore();
  const ri = ops.roomBookings.findIndex((b) => b.id === id);
  if (ri >= 0) {
    const cur = ops.roomBookings[ri];
    const advance =
      patch.advance !== undefined
        ? Math.max(0, Number(patch.advance) || 0)
        : (cur.advance ?? 0);
    const balance =
      patch.balance !== undefined
        ? Math.max(0, Number(patch.balance) || 0)
        : Math.max(0, cur.total - advance);
    const next: RoomBooking = {
      ...cur,
      guestName: patch.guestName?.trim() || cur.guestName,
      phone: patch.phone?.trim() || cur.phone,
      address:
        patch.address !== undefined
          ? patch.address.trim() || undefined
          : cur.address,
      advance,
      balance,
    };
    ops.roomBookings[ri] = next;
    await saveOps(ops);
    return { booking: next };
  }
  const fi = ops.foodOrders.findIndex((o) => o.id === id);
  if (fi >= 0) {
    const cur = ops.foodOrders[fi];
    const advance =
      patch.advance !== undefined
        ? Math.max(0, Number(patch.advance) || 0)
        : (cur.advance ?? 0);
    const balance =
      patch.balance !== undefined
        ? Math.max(0, Number(patch.balance) || 0)
        : Math.max(0, cur.total - advance);
    const next: FoodOrder = {
      ...cur,
      guestName: patch.guestName?.trim() || cur.guestName,
      phone: patch.phone?.trim() || cur.phone,
      address:
        patch.address !== undefined
          ? patch.address.trim() || undefined
          : cur.address,
      advance,
      balance,
    };
    ops.foodOrders[fi] = next;
    await saveOps(ops);
    return { order: next };
  }
  return { error: "Record not found." };
}

export async function updateTableStatus(id: string, status: DiningTable["status"]) {
  const ops = await getOpsStore();
  const i = ops.tables.findIndex((t) => t.id === id);
  if (i < 0) return { error: "Table not found." };
  ops.tables[i] = { ...ops.tables[i], status };
  await saveOps(ops);
  return { table: ops.tables[i] };
}

export async function updateKitchenTicket(id: string, status: KitchenTicket["status"]) {
  const ops = await getOpsStore();
  const i = ops.kitchenTickets.findIndex((t) => t.id === id);
  if (i < 0) return { error: "Ticket not found." };
  ops.kitchenTickets[i] = {
    ...ops.kitchenTickets[i],
    status,
    updatedAt: new Date().toISOString(),
  };
  const orderId = ops.kitchenTickets[i].orderId;
  const oi = ops.foodOrders.findIndex((o) => o.id === orderId);
  if (oi >= 0) {
    const map: Record<KitchenTicket["status"], FoodOrder["status"]> = {
      queued: "placed",
      cooking: "preparing",
      ready: "ready",
      bumped: "served",
    };
    ops.foodOrders[oi] = { ...ops.foodOrders[oi], status: map[status] };
  }
  await saveOps(ops);
  return { ticket: ops.kitchenTickets[i] };
}

export async function addLedgerEntry(input: Omit<LedgerEntry, "id" | "createdAt">) {
  const entry: LedgerEntry = { ...input, id: uid("led"), createdAt: new Date().toISOString() };
  const ops = await getOpsStore();
  ops.ledger.unshift(entry);
  await saveOps(ops);
  return { entry };
}

export async function updateLedgerEntry(
  id: string,
  patch: Partial<Pick<LedgerEntry, "kind" | "category" | "description" | "amount" | "refId">>,
): Promise<{ entry?: LedgerEntry; error?: string }> {
  const ops = await getOpsStore();
  const i = ops.ledger.findIndex((e) => e.id === id);
  if (i < 0) return { error: "Not found" };
  const cur = ops.ledger[i];
  const next: LedgerEntry = {
    ...cur,
    kind: patch.kind === "income" || patch.kind === "expense" ? patch.kind : cur.kind,
    category: patch.category?.trim() || cur.category,
    description: patch.description?.trim() || cur.description,
    amount: patch.amount !== undefined ? Math.max(0, Number(patch.amount) || 0) : cur.amount,
    refId: patch.refId !== undefined ? patch.refId || undefined : cur.refId,
  };
  ops.ledger[i] = next;
  await saveOps(ops);
  return { entry: next };
}

export async function deleteLedgerEntry(id: string): Promise<{ ok?: boolean; error?: string }> {
  const ops = await getOpsStore();
  const before = ops.ledger.length;
  ops.ledger = ops.ledger.filter((e) => e.id !== id);
  if (ops.ledger.length === before) return { error: "Not found" };
  await saveOps(ops);
  return { ok: true };
}

function numMoney(v: unknown, fallback = 0) {
  return Math.max(0, Number(v) || fallback);
}

export async function addDayBookEntry(
  input: Omit<DayBookEntry, "id" | "createdAt" | "balance" | "date"> & {
    date?: string;
    balance?: number;
  },
) {
  const createdAt = new Date().toISOString();
  const debit = numMoney(input.debit);
  const credit = numMoney(input.credit);
  const entry: DayBookEntry = {
    date: (input.date || createdAt).slice(0, 10),
    voucherNo: String(input.voucherNo || "").trim() || `DB-${Date.now().toString(36).toUpperCase()}`,
    particular: String(input.particular || "").trim(),
    debit,
    credit,
    balance: input.balance !== undefined ? numMoney(input.balance) : Math.max(0, debit - credit),
    category: String(input.category || "Cash").trim() || "Cash",
    notes: input.notes?.trim() || undefined,
    id: uid("db"),
    createdAt,
  };
  const ops = await getOpsStore();
  ops.dayBook.unshift(entry);
  await saveOps(ops);
  return { entry };
}

export async function updateDayBookEntry(
  id: string,
  patch: Partial<
    Pick<DayBookEntry, "date" | "voucherNo" | "particular" | "debit" | "credit" | "balance" | "category" | "notes">
  >,
): Promise<{ entry?: DayBookEntry; error?: string }> {
  const ops = await getOpsStore();
  const i = ops.dayBook.findIndex((e) => e.id === id);
  if (i < 0) return { error: "Not found" };
  const cur = ops.dayBook[i];
  const debit = patch.debit !== undefined ? numMoney(patch.debit) : cur.debit;
  const credit = patch.credit !== undefined ? numMoney(patch.credit) : cur.credit;
  const next: DayBookEntry = {
    ...cur,
    date: patch.date ? patch.date.slice(0, 10) : cur.date,
    voucherNo: patch.voucherNo?.trim() || cur.voucherNo,
    particular: patch.particular?.trim() || cur.particular,
    debit,
    credit,
    balance:
      patch.balance !== undefined ? numMoney(patch.balance) : Math.max(0, debit - credit),
    category: patch.category?.trim() || cur.category,
    notes: patch.notes !== undefined ? patch.notes.trim() || undefined : cur.notes,
  };
  ops.dayBook[i] = next;
  await saveOps(ops);
  return { entry: next };
}

export async function deleteDayBookEntry(id: string): Promise<{ ok?: boolean; error?: string }> {
  const ops = await getOpsStore();
  const before = ops.dayBook.length;
  ops.dayBook = ops.dayBook.filter((e) => e.id !== id);
  if (ops.dayBook.length === before) return { error: "Not found" };
  await saveOps(ops);
  return { ok: true };
}

export async function addMusterEntry(
  input: Omit<MusterEntry, "id" | "createdAt">,
) {
  const createdAt = new Date().toISOString();
  const status =
    input.status === "absent" || input.status === "half" ? input.status : "present";
  const entry: MusterEntry = {
    date: (input.date || createdAt).slice(0, 10),
    staffName: String(input.staffName || "").trim(),
    status,
    notes: input.notes?.trim() || undefined,
    id: uid("mus"),
    createdAt,
  };
  const ops = await getOpsStore();
  ops.muster.unshift(entry);
  await saveOps(ops);
  return { entry };
}

export async function updateMusterEntry(
  id: string,
  patch: Partial<Pick<MusterEntry, "date" | "staffName" | "status" | "notes">>,
): Promise<{ entry?: MusterEntry; error?: string }> {
  const ops = await getOpsStore();
  const i = ops.muster.findIndex((e) => e.id === id);
  if (i < 0) return { error: "Not found" };
  const cur = ops.muster[i];
  const status =
    patch.status === "present" || patch.status === "absent" || patch.status === "half"
      ? patch.status
      : cur.status;
  const next: MusterEntry = {
    ...cur,
    date: patch.date ? patch.date.slice(0, 10) : cur.date,
    staffName: patch.staffName?.trim() || cur.staffName,
    status,
    notes: patch.notes !== undefined ? patch.notes.trim() || undefined : cur.notes,
  };
  ops.muster[i] = next;
  await saveOps(ops);
  return { entry: next };
}

export async function deleteMusterEntry(id: string): Promise<{ ok?: boolean; error?: string }> {
  const ops = await getOpsStore();
  const before = ops.muster.length;
  ops.muster = ops.muster.filter((e) => e.id !== id);
  if (ops.muster.length === before) return { error: "Not found" };
  await saveOps(ops);
  return { ok: true };
}

export async function addSalaryEntry(
  input: Omit<SalaryEntry, "id" | "createdAt" | "net"> & { net?: number },
) {
  const createdAt = new Date().toISOString();
  const basic = numMoney(input.basic);
  const deductions = numMoney(input.deductions);
  const entry: SalaryEntry = {
    month: (input.month || createdAt).slice(0, 7),
    staffName: String(input.staffName || "").trim(),
    basic,
    deductions,
    net: input.net !== undefined ? numMoney(input.net) : Math.max(0, basic - deductions),
    status: input.status === "paid" ? "paid" : "pending",
    notes: input.notes?.trim() || undefined,
    id: uid("sal"),
    createdAt,
  };
  const ops = await getOpsStore();
  ops.salaries.unshift(entry);
  await saveOps(ops);
  return { entry };
}

export async function updateSalaryEntry(
  id: string,
  patch: Partial<
    Pick<SalaryEntry, "month" | "staffName" | "basic" | "deductions" | "net" | "status" | "notes">
  >,
): Promise<{ entry?: SalaryEntry; error?: string }> {
  const ops = await getOpsStore();
  const i = ops.salaries.findIndex((e) => e.id === id);
  if (i < 0) return { error: "Not found" };
  const cur = ops.salaries[i];
  const basic = patch.basic !== undefined ? numMoney(patch.basic) : cur.basic;
  const deductions = patch.deductions !== undefined ? numMoney(patch.deductions) : cur.deductions;
  const next: SalaryEntry = {
    ...cur,
    month: patch.month ? patch.month.slice(0, 7) : cur.month,
    staffName: patch.staffName?.trim() || cur.staffName,
    basic,
    deductions,
    net:
      patch.net !== undefined
        ? numMoney(patch.net)
        : Math.max(0, basic - deductions),
    status: patch.status === "paid" || patch.status === "pending" ? patch.status : cur.status,
    notes: patch.notes !== undefined ? patch.notes.trim() || undefined : cur.notes,
  };
  ops.salaries[i] = next;
  await saveOps(ops);
  return { entry: next };
}

export async function deleteSalaryEntry(id: string): Promise<{ ok?: boolean; error?: string }> {
  const ops = await getOpsStore();
  const before = ops.salaries.length;
  ops.salaries = ops.salaries.filter((e) => e.id !== id);
  if (ops.salaries.length === before) return { error: "Not found" };
  await saveOps(ops);
  return { ok: true };
}

const PURCHASE_TYPES: PurchaseType[] = [
  "groceries",
  "ingredients",
  "dhobi",
  "clothes",
  "housekeeping",
  "other",
];

function asPurchaseType(v: unknown): PurchaseType {
  const s = String(v || "");
  return PURCHASE_TYPES.includes(s as PurchaseType) ? (s as PurchaseType) : "other";
}

export async function addPurchaseEntry(
  input: Omit<PurchaseEntry, "id" | "createdAt">,
) {
  const createdAt = new Date().toISOString();
  const entry: PurchaseEntry = {
    date: (input.date || createdAt).slice(0, 10),
    type: asPurchaseType(input.type),
    item: String(input.item || "").trim(),
    vendor: String(input.vendor || "").trim(),
    qty: Math.max(0, Number(input.qty) || 0),
    unit: String(input.unit || "pcs").trim() || "pcs",
    amount: numMoney(input.amount),
    notes: input.notes?.trim() || undefined,
    id: uid("pur"),
    createdAt,
  };
  const ops = await getOpsStore();
  ops.purchases.unshift(entry);
  await saveOps(ops);
  return { entry };
}

export async function updatePurchaseEntry(
  id: string,
  patch: Partial<
    Pick<PurchaseEntry, "date" | "type" | "item" | "vendor" | "qty" | "unit" | "amount" | "notes">
  >,
): Promise<{ entry?: PurchaseEntry; error?: string }> {
  const ops = await getOpsStore();
  const i = ops.purchases.findIndex((e) => e.id === id);
  if (i < 0) return { error: "Not found" };
  const cur = ops.purchases[i];
  const next: PurchaseEntry = {
    ...cur,
    date: patch.date ? patch.date.slice(0, 10) : cur.date,
    type: patch.type !== undefined ? asPurchaseType(patch.type) : cur.type,
    item: patch.item?.trim() || cur.item,
    vendor: patch.vendor?.trim() || cur.vendor,
    qty: patch.qty !== undefined ? Math.max(0, Number(patch.qty) || 0) : cur.qty,
    unit: patch.unit?.trim() || cur.unit,
    amount: patch.amount !== undefined ? numMoney(patch.amount) : cur.amount,
    notes: patch.notes !== undefined ? patch.notes.trim() || undefined : cur.notes,
  };
  ops.purchases[i] = next;
  await saveOps(ops);
  return { entry: next };
}

export async function deletePurchaseEntry(id: string): Promise<{ ok?: boolean; error?: string }> {
  const ops = await getOpsStore();
  const before = ops.purchases.length;
  ops.purchases = ops.purchases.filter((e) => e.id !== id);
  if (ops.purchases.length === before) return { error: "Not found" };
  await saveOps(ops);
  return { ok: true };
}

export async function addStockMove(
  input: Omit<StockMove, "id" | "createdAt" | "amount" | "advance" | "balance"> & {
    amount?: number;
    advance?: number;
    balance?: number;
    date?: string;
  },
) {
  const createdAt = new Date().toISOString();
  const amount = Math.max(0, Number(input.amount) || 0);
  const advance = Math.max(0, Math.min(amount, Number(input.advance) || 0));
  const balance =
    input.balance !== undefined
      ? Math.max(0, Number(input.balance) || 0)
      : Math.max(0, amount - advance);
  const move: StockMove = {
    direction: input.direction,
    item: input.item.trim(),
    quantity: Number(input.quantity) || 0,
    unit: input.unit.trim() || "pcs",
    vendorOrDept: input.vendorOrDept.trim(),
    amount,
    advance,
    balance,
    date: (input.date || createdAt).slice(0, 10),
    notes: input.notes?.trim() || undefined,
    id: uid(input.direction === "inward" ? "in" : "out"),
    createdAt,
  };
  const ops = await getOpsStore();
  if (input.direction === "inward") ops.inward.unshift(move);
  else ops.outward.unshift(move);
  await saveOps(ops);
  return { move };
}

export async function updateStockMove(
  id: string,
  patch: Partial<
    Pick<
      StockMove,
      | "item"
      | "quantity"
      | "unit"
      | "vendorOrDept"
      | "amount"
      | "advance"
      | "balance"
      | "date"
      | "notes"
    >
  >,
): Promise<{ move?: StockMove; error?: string }> {
  const ops = await getOpsStore();
  const lists = [
    { key: "inward" as const, list: ops.inward },
    { key: "outward" as const, list: ops.outward },
  ];
  for (const { key, list } of lists) {
    const i = list.findIndex((m) => m.id === id);
    if (i < 0) continue;
    const cur = list[i];
    const amount =
      patch.amount !== undefined
        ? Math.max(0, Number(patch.amount) || 0)
        : (cur.amount ?? 0);
    const advance =
      patch.advance !== undefined
        ? Math.max(0, Number(patch.advance) || 0)
        : (cur.advance ?? 0);
    const balance =
      patch.balance !== undefined
        ? Math.max(0, Number(patch.balance) || 0)
        : Math.max(0, amount - advance);
    const next: StockMove = {
      ...cur,
      item: patch.item?.trim() || cur.item,
      quantity:
        patch.quantity !== undefined
          ? Number(patch.quantity) || 0
          : cur.quantity,
      unit: patch.unit?.trim() || cur.unit,
      vendorOrDept: patch.vendorOrDept?.trim() || cur.vendorOrDept,
      amount,
      advance,
      balance,
      date: patch.date ? patch.date.slice(0, 10) : cur.date || cur.createdAt.slice(0, 10),
      notes:
        patch.notes !== undefined
          ? patch.notes.trim() || undefined
          : cur.notes,
    };
    ops[key][i] = next;
    await saveOps(ops);
    return { move: next };
  }
  return { error: "Stock move not found." };
}

export async function getRoomBooking(id: string) {
  return (await getOpsStore()).roomBookings.find((b) => b.id === id);
}


/** Persist full catalog (Admin CMS). */
export async function saveCatalog(catalog: Catalog): Promise<void> {
  await writeJson("catalog.json", catalog);
}

export async function updateHotel(patch: Partial<HotelInfo>): Promise<HotelInfo> {
  const catalog = await getCatalog();
  catalog.hotel = { ...catalog.hotel, ...patch };
  await saveCatalog(catalog);
  return catalog.hotel;
}

type ListKey = "rooms" | "venues" | "menu" | "buffets" | "facilities";

export async function upsertCatalogItem<K extends ListKey>(
  key: K,
  item: Catalog[K][number],
): Promise<Catalog[K][number]> {
  const catalog = await getCatalog();
  const list = catalog[key] as Array<{ id: string }>;
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx >= 0) list[idx] = item as (typeof list)[number];
  else list.unshift(item as (typeof list)[number]);
  await saveCatalog(catalog);
  return item;
}

export async function deleteCatalogItem(
  key: ListKey,
  id: string,
): Promise<boolean> {
  const catalog = await getCatalog();
  const list = catalog[key] as Array<{ id: string }>;
  const next = list.filter((x) => x.id !== id);
  if (next.length === list.length) return false;
  (catalog as Record<string, unknown>)[key] = next;
  await saveCatalog(catalog);
  return true;
}
