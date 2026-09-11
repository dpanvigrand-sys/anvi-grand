import type { Metadata } from "next";
import Image from "next/image";
import { FoodOrderForm } from "@/components/anvi/food-order-form";
import { getHotel, getMenu } from "@/lib/store";

export const metadata: Metadata = { title: "CHIGURU Food Order" };

export default async function FoodPage() {
  const [hotel, menu] = await Promise.all([getHotel(), getMenu()]);
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">
      <Image
        src="/logos/chiguru.svg"
        alt="CHIGURU"
        width={180}
        height={48}
        className="h-11 w-auto"
        priority
      />
      <h1 className="mt-5 font-display text-5xl text-[var(--ag-ink)]">
        Order Andhra favourites
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--ag-muted)]">
        Room service and takeaway from the {hotel.foodBrand} kitchen at ANVI GRAND.
        Clear ₹ prices on every dish. Orders appear on the KT board for the cooks.
      </p>
      <p className="mt-2 text-sm text-[var(--ag-chocolate)]">
        Call{" "}
        <a href="tel:7569494949" className="font-medium text-[var(--ag-red)]">
          7569494949
        </a>{" "}
        for banquet catering.
      </p>
      <div className="mt-10 border border-[var(--ag-line)] bg-white/80 p-5 md:p-8">
        <FoodOrderForm menu={menu} />
      </div>
    </div>
  );
}
