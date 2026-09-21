import type { OpsSettings, OpsStationId } from "@/lib/types";

export type OpsStationDef = {
  id: OpsStationId;
  /** Client PC label e.g. Reception.1 */
  clientLabel: string;
  href: "/ops" | `/ops/${string}`;
  en: string;
  /** One-job subtitle */
  job: string;
  tone: string;
  /** Alert categories this station cares about */
  alertKinds: Array<
    "rooms" | "food" | "grocery" | "banquet" | "salary" | "housekeeping"
  >;
};

export const OPS_STATIONS: OpsStationDef[] = [
  {
    id: "reception",
    clientLabel: "Reception.1",
    href: "/ops/reception",
    en: "Reception",
    job: "Room check-in / out, bookings ledger, guest desk & walk-ins",
    tone: "bg-[var(--ag-red)]",
    alertKinds: ["rooms"],
  },
  {
    id: "server",
    clientLabel: "Server.1",
    href: "/ops/server",
    en: "Server",
    job: "Restaurant floor — take/serve orders, table status, send to KT",
    tone: "bg-[var(--ag-red-deep)]",
    alertKinds: ["food"],
  },
  {
    id: "kitchen",
    clientLabel: "Kitchen.1",
    href: "/ops/kitchen",
    en: "KT Kitchen",
    job: "Incoming food tickets, prep status, mark ready",
    tone: "bg-[var(--ag-maroon)]",
    alertKinds: ["food"],
  },
  {
    id: "manager",
    clientLabel: "Restaurant Manager.1",
    href: "/ops/manager",
    en: "Restaurant Manager",
    job: "IRAA Dine oversight — menu ₹, food bookings, kitchen/server pulse",
    tone: "bg-[var(--ag-chocolate)]",
    alertKinds: ["food", "grocery"],
  },
  {
    id: "store",
    clientLabel: "Store.1",
    href: "/ops/store",
    en: "Store",
    job: "Inward / outward, stock reports, grocery & HK purchase links",
    tone: "bg-[var(--ag-maroon)]",
    alertKinds: ["grocery"],
  },
  {
    id: "accounts",
    clientLabel: "Accounts.1",
    href: "/ops/accounts",
    en: "Accounts",
    job: "Day book, ledger, muster, salaries, purchases",
    tone: "bg-[var(--ag-red-deep)]",
    alertKinds: ["salary", "rooms", "banquet"],
  },
  {
    id: "admin",
    clientLabel: "Admin.1",
    href: "/ops/admin",
    en: "Admin",
    job: "CMS — rooms, food, venues, photos, contacts, reports, settings",
    tone: "bg-[var(--ag-red)]",
    alertKinds: ["rooms", "food", "grocery", "banquet", "salary", "housekeeping"],
  },
  {
    id: "housekeeping",
    clientLabel: "Housekeeping.1",
    href: "/ops/housekeeping",
    en: "Housekeeping",
    job: "Room dirty/clean/ready, linen & dhobi queue, supplies alerts",
    tone: "bg-[var(--ag-chocolate)]",
    alertKinds: ["housekeeping", "rooms", "grocery"],
  },
  {
    id: "banquet",
    clientLabel: "Banquet.1",
    href: "/ops/banquet",
    en: "Banquet",
    job: "Venue bookings, today’s events, advance/balance, venue rates",
    tone: "bg-[var(--ag-maroon)]",
    alertKinds: ["banquet"],
  },
];

export const DEFAULT_OPS_SETTINGS: OpsSettings = {
  hotelNameLine: "ANVI GRAND",
  foodBrandLine: "IRAA Dine",
  opsPasswordNote: "Demo password: anviops2026 (change only via code / deploy secrets)",
  lowStockQty: 15,
  banquetReminderHours: 36,
  stationLabels: {},
};

export function resolveStationLabel(
  station: OpsStationDef,
  settings?: OpsSettings | null,
) {
  const override = settings?.stationLabels?.[station.id];
  return {
    en: override?.en || station.en,
    job: override?.subtitle || station.job,
  };
}

export function getStation(id: OpsStationId) {
  return OPS_STATIONS.find((s) => s.id === id)!;
}
