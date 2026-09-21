import type { Metadata } from "next";
import Image from "next/image";
import { FoodOrderForm } from "@/components/anvi/food-order-form";
import { getHotel, getMenu, resolveHotelPhones } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "IRAA Dining" };

export default async function FoodPage() {
  const [hotel, menu] = await Promise.all([getHotel(), getMenu()]);
  const phones = resolveHotelPhones(hotel);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">
      <Image
        src="/logos/iraa.svg"
        alt="IRAA"
        width={180}
        height={48}
        className="h-11 w-auto"
        priority
      />
      <h1 className="mt-5 font-display text-4xl text-[var(--ag-ink)] md:text-5xl">
        Order from IRAA Restaurant
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--ag-muted)]">
        Room service and takeaway from the {hotel.foodBrand} kitchen at ANVI
        GRAND. Clear ₹ prices on every dish. Pay Now sends tickets to the kitchen
        board.
      </p>
      <p className="mt-2 text-sm text-[var(--ag-chocolate)]">
        Call food desk{" "}
        <a href={`tel:${phones.food}`} className="font-medium text-[var(--ag-red)]">
          {phones.food}
        </a>{" "}
        for banquet catering.
      </p>
      <div className="mt-10">
        <FoodOrderForm menu={menu} variant="page" contactPhone={phones.food} />
      </div>
    </div>
  );
}
