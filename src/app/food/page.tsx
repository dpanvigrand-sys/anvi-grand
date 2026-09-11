import type { Metadata } from "next";
import { FoodOrderForm } from "@/components/anvi/food-order-form";
import { getHotel, getMenu } from "@/lib/store";

export const metadata: Metadata = { title: "CHIGURU Food Order" };

export default async function FoodPage() {
  const [hotel, menu] = await Promise.all([getHotel(), getMenu()]);
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--ag-red)]">{hotel.foodBrand}</p>
      <h1 className="mt-3 font-display text-5xl text-[var(--ag-ink)]">Order Andhra favourites</h1>
      <p className="mt-4 max-w-2xl text-[var(--ag-muted)]">
        Room service and takeaway from the {hotel.foodBrand} kitchen. Orders appear on the KT board for the cooks.
      </p>
      <div className="mt-10 border border-[var(--ag-line)] bg-white/80 p-5 md:p-8">
        <FoodOrderForm menu={menu} />
      </div>
    </div>
  );
}
