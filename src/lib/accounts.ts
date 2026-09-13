import type { PurchaseType } from "./types";

export const PURCHASE_TYPES: {
  id: PurchaseType;
  label: string;
  te: string;
}[] = [
  { id: "groceries", label: "Groceries", te: "కిరాణా" },
  { id: "ingredients", label: "Ingredients (kitchen)", te: "వంట పదార్థాలు" },
  { id: "dhobi", label: "Dhobi / laundry", te: "ధోబీ / లాండ్రీ" },
  { id: "clothes", label: "Clothes / linen", te: "బట్టలు / లినెన్" },
  { id: "housekeeping", label: "Housekeeping supplies", te: "హౌస్‌కీపింగ్ సామాను" },
  { id: "other", label: "Other purchases", te: "ఇతర కొనుగోళ్లు" },
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
  present: { en: "Present", te: "హాజరు" },
  absent: { en: "Absent", te: "గైర్‌హాజరు" },
  half: { en: "Half day", te: "సగం రోజు" },
} as const;

export function purchaseTypeLabel(type: PurchaseType) {
  return PURCHASE_TYPES.find((t) => t.id === type) || PURCHASE_TYPES[5];
}

export function isPurchaseType(v: string): v is PurchaseType {
  return PURCHASE_TYPES.some((t) => t.id === v);
}
