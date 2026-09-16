import { NextResponse } from "next/server";
import {
  filterCounterBookingsForStation,
  listCounterBookingItems,
  stationSupportsCounterToast,
  type CounterBookingStation,
} from "@/lib/counter-bookings";
import { getOps } from "@/lib/store";

export const dynamic = "force-dynamic";

const STATIONS = new Set<CounterBookingStation>([
  "hub",
  "reception",
  "server",
  "kitchen",
  "manager",
  "store",
  "accounts",
  "admin",
  "housekeeping",
  "banquet",
]);

/**
 * Pending counter booking/order toast feed.
 * Client passes `station` + optional `since` (ISO) and/or `seen` (comma ids).
 * OK dismiss is client localStorage; this endpoint only lists what's new.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const stationRaw = (url.searchParams.get("station") || "hub").toLowerCase();
  const station = stationRaw as CounterBookingStation;
  if (!STATIONS.has(station)) {
    return NextResponse.json({ error: "Invalid station" }, { status: 400 });
  }
  if (!stationSupportsCounterToast(station)) {
    return NextResponse.json({
      station,
      items: [],
      count: 0,
      latest: null,
      generatedAt: new Date().toISOString(),
    });
  }

  const since = url.searchParams.get("since");
  const seenParam = url.searchParams.get("seen");
  const seen = seenParam
    ? seenParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;

  const ops = await getOps();
  const all = listCounterBookingItems(ops);
  const items = filterCounterBookingsForStation(all, station, since, seen);
  const latest = items[0] ?? null;

  return NextResponse.json({
    station,
    items,
    count: items.length,
    latest,
    generatedAt: new Date().toISOString(),
  });
}
