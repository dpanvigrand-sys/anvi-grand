import type { StockMove } from "@/lib/types";

export type StockRow = {
  id: string;
  direction: "inward" | "outward";
  date: string;
  item: string;
  party: string;
  quantity: number;
  unit: string;
  amount: number;
  advance: number;
  balance: number;
  notes: string;
};

export function stockMovesToRows(
  inward: StockMove[],
  outward: StockMove[],
): StockRow[] {
  const map = (m: StockMove): StockRow => ({
    id: m.id,
    direction: m.direction,
    date: (m.date || m.createdAt || "").slice(0, 10),
    item: m.item,
    party: m.vendorOrDept,
    quantity: m.quantity,
    unit: m.unit,
    amount: m.amount ?? 0,
    advance: m.advance ?? 0,
    balance: m.balance ?? Math.max(0, (m.amount ?? 0) - (m.advance ?? 0)),
    notes: m.notes || "",
  });
  return [...inward.map(map), ...outward.map(map)].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}
