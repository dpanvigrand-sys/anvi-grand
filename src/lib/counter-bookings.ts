import type {
  FoodOrder,
  OpsStationId,
  OpsStore,
  RoomBooking,
  VenueBooking,
} from "@/lib/types";

export type CounterBookingKind =
  | "room"
  | "banquet"
  | "party-hall"
  | "food";

export type CounterBookingItem = {
  id: string;
  kind: CounterBookingKind;
  label: string;
  guestName: string;
  time: string;
  detail: string;
  createdAt: string;
};

export type CounterBookingStation = OpsStationId | "hub";

/** Which booking kinds each counter screen watches */
export const STATION_BOOKING_KINDS: Partial<
  Record<CounterBookingStation, CounterBookingKind[]>
> = {
  reception: ["room"],
  banquet: ["banquet", "party-hall"],
  kitchen: ["food"],
  server: ["food"],
  hub: ["room", "banquet", "party-hall", "food"],
  admin: ["room", "banquet", "party-hall", "food"],
  manager: ["food"],
};

function kindLabel(kind: CounterBookingKind): string {
  switch (kind) {
    case "room":
      return "Room booking";
    case "banquet":
      return "Banquet hall";
    case "party-hall":
      return "Mini hall";
    case "food":
      return "Food order";
  }
}

function formatClock(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function fromRoom(b: RoomBooking): CounterBookingItem {
  return {
    id: b.id,
    kind: "room",
    label: kindLabel("room"),
    guestName: b.guestName,
    time: formatClock(b.createdAt),
    detail: `${b.roomName} · ${b.checkIn} → ${b.checkOut} · ${b.status}`,
    createdAt: b.createdAt,
  };
}

function fromVenue(b: VenueBooking): CounterBookingItem {
  const kind: CounterBookingKind =
    b.type === "party-hall" ? "party-hall" : "banquet";
  return {
    id: b.id,
    kind,
    label: kindLabel(kind),
    guestName: b.guestName,
    time: formatClock(b.createdAt),
    detail: `${b.venueName} · event ${b.eventDate} · ${b.guests} guests`,
    createdAt: b.createdAt,
  };
}

function fromFood(o: FoodOrder): CounterBookingItem {
  const itemSummary = o.items
    .slice(0, 2)
    .map((i) => `${i.qty}× ${i.name}`)
    .join(", ");
  const more = o.items.length > 2 ? ` +${o.items.length - 2}` : "";
  return {
    id: o.id,
    kind: "food",
    label: kindLabel("food"),
    guestName: o.guestName,
    time: formatClock(o.createdAt),
    detail: `${itemSummary}${more} · ₹${o.total} · ${o.source}`,
    createdAt: o.createdAt,
  };
}

export function listCounterBookingItems(ops: OpsStore): CounterBookingItem[] {
  const rooms = ops.roomBookings
    .filter((b) => b.status !== "cancelled")
    .map(fromRoom);
  const venues = ops.venueBookings
    .filter((b) => b.status !== "cancelled")
    .map(fromVenue);
  const food = ops.foodOrders
    .filter((o) => o.status !== "cancelled")
    .map(fromFood);
  return [...rooms, ...venues, ...food].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function filterCounterBookingsForStation(
  items: CounterBookingItem[],
  station: CounterBookingStation,
  sinceIso?: string | null,
  seenIds?: Set<string> | string[],
): CounterBookingItem[] {
  const kinds = STATION_BOOKING_KINDS[station];
  if (!kinds || kinds.length === 0) return [];
  const seen = seenIds
    ? seenIds instanceof Set
      ? seenIds
      : new Set(seenIds)
    : null;
  const sinceMs = sinceIso ? Date.parse(sinceIso) : NaN;
  /** First visit (no ack): only surface recent bookings so old ledger rows don't flood. */
  const defaultWindowMs = Date.now() - 36 * 60 * 60 * 1000;

  return items.filter((item) => {
    if (!kinds.includes(item.kind)) return false;
    if (seen?.has(item.id)) return false;
    const t = Date.parse(item.createdAt);
    if (Number.isNaN(t)) return false;
    if (!Number.isNaN(sinceMs)) {
      if (t <= sinceMs) return false;
    } else if (t < defaultWindowMs) {
      return false;
    }
    return true;
  });
}

export function stationSupportsCounterToast(
  station: CounterBookingStation,
): boolean {
  const kinds = STATION_BOOKING_KINDS[station];
  return Boolean(kinds && kinds.length > 0);
}
