import type { OpsSettings, OpsStationId } from "@/lib/types";

export type OpsStationDef = {
  id: OpsStationId;
  /** Client PC label e.g. Reception.1 */
  clientLabel: string;
  href: "/ops" | `/ops/${string}`;
  en: string;
  te: string;
  /** One-job subtitle */
  job: string;
  jobTe: string;
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
    te: "రిసెప్షన్",
    job: "Room check-in / out, bookings ledger, guest desk & walk-ins",
    jobTe: "రూమ్ చెక్-ఇన్/అవుట్ · బుకింగ్స్ · గెస్ట్ డెస్క్",
    tone: "bg-[var(--ag-red)]",
    alertKinds: ["rooms"],
  },
  {
    id: "server",
    clientLabel: "Server.1",
    href: "/ops/server",
    en: "Server",
    te: "సర్వర్",
    job: "Restaurant floor — take/serve orders, table status, send to KT",
    jobTe: "టేబుల్ · ఆర్డర్ · కిచెన్‌కు పంపు",
    tone: "bg-[var(--ag-red-deep)]",
    alertKinds: ["food"],
  },
  {
    id: "kitchen",
    clientLabel: "Kitchen.1",
    href: "/ops/kitchen",
    en: "KT Kitchen",
    te: "కిచెన్ (KT)",
    job: "Incoming food tickets, prep status, mark ready",
    jobTe: "టికెట్లు · వంట · రెడీ",
    tone: "bg-[var(--ag-maroon)]",
    alertKinds: ["food"],
  },
  {
    id: "manager",
    clientLabel: "Restaurant Manager.1",
    href: "/ops/manager",
    en: "Restaurant Manager",
    te: "రెస్టారెంట్ మేనేజర్",
    job: "CHIGURU oversight — menu ₹, food bookings, kitchen/server pulse",
    jobTe: "మెనూ ధరలు · ఫుడ్ బుకింగ్స్ · KT/సర్వర్",
    tone: "bg-[var(--ag-chocolate)]",
    alertKinds: ["food", "grocery"],
  },
  {
    id: "store",
    clientLabel: "Store.1",
    href: "/ops/store",
    en: "Store",
    te: "స్టోర్",
    job: "Inward / outward, stock reports, grocery & HK purchase links",
    jobTe: "ఇన్‌వర్డ్/అవుట్‌వర్డ్ · స్టాక్ · కొనుగోళ్లు",
    tone: "bg-[var(--ag-maroon)]",
    alertKinds: ["grocery"],
  },
  {
    id: "accounts",
    clientLabel: "Accounts.1",
    href: "/ops/accounts",
    en: "Accounts",
    te: "అకౌంట్స్",
    job: "Day book, ledger, muster, salaries, purchases",
    jobTe: "డే బుక్ · లెడ్జర్ · మస్టర్ · జీతాలు",
    tone: "bg-[var(--ag-red-deep)]",
    alertKinds: ["salary", "rooms", "banquet"],
  },
  {
    id: "admin",
    clientLabel: "Admin.1",
    href: "/ops/admin",
    en: "Admin",
    te: "అడ్మిన్",
    job: "CMS — rooms, food, venues, photos, contacts, reports, settings",
    jobTe: "CMS · ఫోటోలు · రిపోర్టులు · సెట్టింగ్స్",
    tone: "bg-[var(--ag-red)]",
    alertKinds: ["rooms", "food", "grocery", "banquet", "salary", "housekeeping"],
  },
  {
    id: "housekeeping",
    clientLabel: "Housekeeping.1",
    href: "/ops/housekeeping",
    en: "Housekeeping",
    te: "హౌస్‌కీపింగ్",
    job: "Room dirty/clean/ready, linen & dhobi queue, సామాను alerts",
    jobTe: "రూమ్ స్టేటస్ · లినెన్ · ధోబీ · సామాను",
    tone: "bg-[var(--ag-chocolate)]",
    alertKinds: ["housekeeping", "rooms", "grocery"],
  },
  {
    id: "banquet",
    clientLabel: "Banquet.1",
    href: "/ops/banquet",
    en: "Banquet",
    te: "బ్యాంక్వెట్",
    job: "Venue bookings, today’s events, advance/balance, venue rates",
    jobTe: "వేదిక బుకింగ్స్ · ఈవెంట్స్ · బ్యాలెన్స్",
    tone: "bg-[var(--ag-maroon)]",
    alertKinds: ["banquet"],
  },
];

export const DEFAULT_OPS_SETTINGS: OpsSettings = {
  hotelNameLine: "ANVI GRAND",
  foodBrandLine: "CHIGURU",
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
    te: override?.te || station.te,
    job: override?.subtitle || station.job,
  };
}

export function getStation(id: OpsStationId) {
  return OPS_STATIONS.find((s) => s.id === id)!;
}
