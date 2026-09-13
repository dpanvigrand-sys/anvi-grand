import type { PurchaseType } from "./types";

export const PURCHASE_TYPES: {
  id: PurchaseType;
  label: string;
}[] = [
  { id: "groceries", label: "Groceries" },
  { id: "ingredients", label: "Ingredients (kitchen)" },
  { id: "dhobi", label: "Dhobi / laundry" },
  { id: "clothes", label: "Clothes / linen" },
  { id: "housekeeping", label: "Housekeeping supplies" },
  { id: "other", label: "Other purchases" },
];

export const DEFAULT_LEDGER_ACCOUNTS = [
  "Cash",
  "Bank",
  "Rooms income",
  "Food income",
  "Banquet income",
  "Salaries",
  "Groceries",
  "Ingredients",
  "Dhobi",
  "Clothes / linen",
  "Housekeeping",
  "Utilities",
  "Misc expense",
  "Misc income",
];

export const MUSTER_STATUS_LABELS = {
  present: "Present",
  absent: "Absent",
  half: "Half day",
} as const;

export function purchaseTypeLabel(type: PurchaseType) {
  return PURCHASE_TYPES.find((t) => t.id === type) || PURCHASE_TYPES[5];
}

export function isPurchaseType(v: string): v is PurchaseType {
  return PURCHASE_TYPES.some((t) => t.id === v);
}
