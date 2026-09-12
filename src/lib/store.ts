import { promises as fs } from "fs";
import { unstable_noStore as noStore } from "next/cache";
import path from "path";
import { nightsBetween, uid } from "./format";
import type {
  BuffetBooking,
  HotelInfo,
  Catalog,
  ContactMessage,
  DiningTable,
  FoodOrder,
  FoodOrderItem,
  KitchenTicket,
  LedgerEntry,
  OpsStore,
  RoomBooking,
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
  return readJson("ops.json", emptyOps);
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
  const all = (await getCatalog()).venues;
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

export async function addStockMove(input: Omit<StockMove, "id" | "createdAt">) {
  const move: StockMove = {
    ...input,
    id: uid(input.direction === "inward" ? "in" : "out"),
    createdAt: new Date().toISOString(),
  };
  const ops = await getOpsStore();
  if (input.direction === "inward") ops.inward.unshift(move);
  else ops.outward.unshift(move);
  await saveOps(ops);
  return { move };
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
