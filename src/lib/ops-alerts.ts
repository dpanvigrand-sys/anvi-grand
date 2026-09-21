import { DEFAULT_OPS_SETTINGS } from "@/lib/ops-stations";
import type {
  OpsSettings,
  OpsStationId,
  OpsStore,
  StockMove,
} from "@/lib/types";

export type OpsAlertKind =
  | "rooms"
  | "food"
  | "grocery"
  | "banquet"
  | "salary"
  | "housekeeping";

export type OpsAlertSeverity = "info" | "warn" | "critical";

export type OpsAlert = {
  id: string;
  kind: OpsAlertKind;
  severity: OpsAlertSeverity;
  title: string;
  detail: string;
  href: string;
  /** Stations that should surface this alert */
  stations: OpsStationId[];
};

export type StockOnHand = {
  item: string;
  unit: string;
  qty: number;
};

function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function addDaysKey(base: string, days: number) {
  const d = new Date(`${base}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function monthKey(d = new Date()) {
  return d.toISOString().slice(0, 7);
}

export function computeStockOnHand(
  inward: StockMove[],
  outward: StockMove[],
): StockOnHand[] {
  const map = new Map<string, StockOnHand>();
  const keyOf = (item: string, unit: string) =>
    `${item.trim().toLowerCase()}|${unit.trim().toLowerCase()}`;

  for (const m of inward) {
    const k = keyOf(m.item, m.unit);
    const cur = map.get(k) || { item: m.item, unit: m.unit, qty: 0 };
    cur.qty += m.quantity;
    map.set(k, cur);
  }
  for (const m of outward) {
    const k = keyOf(m.item, m.unit);
    const cur = map.get(k) || { item: m.item, unit: m.unit, qty: 0 };
    cur.qty -= m.quantity;
    map.set(k, cur);
  }
  return [...map.values()].sort((a, b) => a.qty - b.qty);
}

export function buildOpsAlerts(
  ops: OpsStore,
  settings?: OpsSettings | null,
): OpsAlert[] {
  const s = { ...DEFAULT_OPS_SETTINGS, ...(settings || ops.settings || {}) };
  const today = todayKey();
  const tomorrow = addDaysKey(today, 1);
  const alerts: OpsAlert[] = [];

  // —— Rooms ——
  const activeRooms = ops.roomBookings.filter(
    (b) => b.status === "checked-in" || b.status === "confirmed",
  );
  const checkoutToday = activeRooms.filter((b) => b.checkOut === today);
  const occupied = ops.roomBookings.filter((b) => b.status === "checked-in");
  const unpaidRooms = ops.roomBookings.filter(
    (b) =>
      (b.balance ?? 0) > 0 &&
      b.status !== "cancelled" &&
      b.status !== "checked-out",
  );

  if (checkoutToday.length) {
    alerts.push({
      id: "rooms-checkout-today",
      kind: "rooms",
      severity: "critical",
      title: `${checkoutToday.length} checkout(s) today`,
      detail: checkoutToday
        .map((b) => `${b.guestName} · ${b.roomName}`)
        .join("; "),
      href: "/ops/reception",
      stations: ["reception", "admin", "housekeeping", "accounts"],
    });
  }

  alerts.push({
    id: "rooms-occupancy",
    kind: "rooms",
    severity: "info",
    title: `Rooms — ${occupied.length} occupied · ${activeRooms.length} active bookings`,
    detail: unpaidRooms.length
      ? `${unpaidRooms.length} booking(s) with unpaid balance`
      : "No unpaid balances on open bookings",
    href: "/ops/reception",
    stations: ["reception", "admin", "accounts"],
  });

  if (unpaidRooms.length) {
    const due = unpaidRooms.reduce((n, b) => n + (b.balance || 0), 0);
    alerts.push({
      id: "rooms-unpaid",
      kind: "rooms",
      severity: "warn",
      title: `Unpaid room balance ₹${due.toLocaleString("en-IN")}`,
      detail: unpaidRooms
        .slice(0, 4)
        .map((b) => `${b.guestName} (₹${b.balance})`)
        .join("; "),
      href: "/ops/admin/bookings",
      stations: ["reception", "accounts", "admin"],
    });
  }

  // —— Food / kitchen ——
  const openTickets = ops.kitchenTickets.filter(
    (t) => t.status === "queued" || t.status === "cooking",
  );
  const readyTickets = ops.kitchenTickets.filter((t) => t.status === "ready");
  const unserved = ops.foodOrders.filter(
    (o) =>
      o.status === "placed" ||
      o.status === "preparing" ||
      o.status === "ready",
  );

  if (openTickets.length || readyTickets.length || unserved.length) {
    alerts.push({
      id: "food-kitchen",
      kind: "food",
      severity: openTickets.length ? "critical" : "warn",
      title: `Kitchen — ${openTickets.length} cooking/queued · ${readyTickets.length} ready`,
      detail: `${unserved.length} unserved food order(s) on floor / room service`,
      href: "/ops/kitchen",
      stations: ["kitchen", "server", "manager", "admin"],
    });
  }

  // —— Grocery / store ——
  const onHand = computeStockOnHand(ops.inward, ops.outward);
  const low = onHand.filter((row) => row.qty <= s.lowStockQty);
  const recentInward = ops.inward.filter((m) => {
    const d = (m.date || m.createdAt || "").slice(0, 10);
    return d >= addDaysKey(today, -2);
  });

  if (low.length) {
    alerts.push({
      id: "grocery-low",
      kind: "grocery",
      severity: "warn",
      title: `Low stock — ${low.length} item(s) ≤ ${s.lowStockQty}`,
      detail: low
        .slice(0, 5)
        .map((r) => `${r.item}: ${r.qty} ${r.unit}`)
        .join("; "),
      href: "/ops/store",
      stations: ["store", "manager", "admin", "housekeeping"],
    });
  } else if (recentInward.length === 0) {
    alerts.push({
      id: "grocery-inward-needed",
      kind: "grocery",
      severity: "info",
      title: "No inward in last 2 days",
      detail: "Consider fresh grocery / ingredient inward for IRAA & HK",
      href: "/ops/inward",
      stations: ["store", "manager", "admin"],
    });
  }

  // —— Banquet ——
  const openVenues = ops.venueBookings.filter((b) => b.status !== "cancelled");
  const eventsToday = openVenues.filter((b) => b.eventDate === today);
  const eventsTomorrow = openVenues.filter((b) => b.eventDate === tomorrow);
  const banquetDue = openVenues.filter((b) => (b.balance ?? 0) > 0);

  if (eventsToday.length || eventsTomorrow.length) {
    alerts.push({
      id: "banquet-upcoming",
      kind: "banquet",
      severity: eventsToday.length ? "critical" : "warn",
      title: `Banquet — ${eventsToday.length} today · ${eventsTomorrow.length} tomorrow`,
      detail: [...eventsToday, ...eventsTomorrow]
        .slice(0, 4)
        .map((b) => `${b.eventDate} · ${b.guestName} · ${b.venueName}`)
        .join("; "),
      href: "/ops/banquet",
      stations: ["banquet", "admin", "accounts", "manager"],
    });
  }

  if (banquetDue.length) {
    const due = banquetDue.reduce((n, b) => n + (b.balance || 0), 0);
    alerts.push({
      id: "banquet-balance",
      kind: "banquet",
      severity: "warn",
      title: `Banquet balance due ₹${due.toLocaleString("en-IN")}`,
      detail: banquetDue
        .slice(0, 4)
        .map((b) => `${b.guestName} (₹${b.balance})`)
        .join("; "),
      href: "/ops/admin/venue-bookings",
      stations: ["banquet", "accounts", "admin"],
    });
  }

  // —— Salary tip ——
  const month = monthKey();
  const unpaidSal = ops.salaries.filter(
    (r) => r.month === month && r.status === "pending",
  );
  if (unpaidSal.length) {
    alerts.push({
      id: "salary-pending",
      kind: "salary",
      severity: "info",
      title: `${unpaidSal.length} salary unpaid this month`,
      detail: unpaidSal.map((r) => r.staffName).join(", "),
      href: "/ops/accounts/salaries",
      stations: ["accounts", "admin"],
    });
  }

  // —— Housekeeping ——
  const dirty = (ops.housekeepingRooms || []).filter(
    (r) => r.status === "dirty" || r.status === "cleaning",
  );
  const linenPending = (ops.linenQueue || []).filter(
    (l) => l.status === "pending" || l.status === "washing",
  );
  if (dirty.length || linenPending.length) {
    alerts.push({
      id: "hk-queue",
      kind: "housekeeping",
      severity: dirty.length ? "warn" : "info",
      title: `HK — ${dirty.length} room(s) need attention · ${linenPending.length} linen`,
      detail: [
        ...dirty.slice(0, 3).map((r) => `${r.roomName}: ${r.status}`),
        ...linenPending.slice(0, 2).map((l) => `${l.item} ×${l.qty}`),
      ].join("; "),
      href: "/ops/housekeeping",
      stations: ["housekeeping", "reception", "admin"],
    });
  }

  return alerts;
}

export function filterAlertsForStation(
  alerts: OpsAlert[],
  stationId: OpsStationId | "hub",
) {
  if (stationId === "hub") return alerts;
  return alerts.filter((a) => a.stations.includes(stationId));
}
