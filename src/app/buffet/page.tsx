import type { Metadata } from "next";
import Image from "next/image";
import { BuffetBookingForm } from "@/components/anvi/buffet-booking-form";
import { formatINR } from "@/lib/format";
import { getBuffets, getHotel, resolveHotelPhones } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Buffet Booking" };

export default async function BuffetPage() {
  const [buffets, hotel] = await Promise.all([getBuffets(), getHotel()]);
  const phones = resolveHotelPhones(hotel);
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--ag-red)]">IRAA Buffet</p>
      <h1 className="mt-3 font-display text-5xl text-[var(--ag-ink)]">Book your table</h1>
      <p className="mt-4 max-w-2xl text-[var(--ag-muted)]">
        Weekend Andhra lunch and executive dinner buffets. Call food desk{" "}
        <a href={`tel:${phones.food}`} className="font-semibold text-[var(--ag-red)]">
          {phones.food}
        </a>
        .
      </p>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {buffets.length === 0 ? (
          <p className="col-span-full rounded-lg border border-[var(--ag-line)] bg-white px-6 py-16 text-center text-[var(--ag-muted)]">
            Buffet menus are being updated. Call {phones.food} for today&apos;s
            IRAA buffet.
          </p>
        ) : (
          buffets.map((b) => (
            <article key={b.id} className="border border-[var(--ag-line)] bg-white/80">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image src={b.image} alt={b.name} fill className="object-cover" sizes="50vw" />
              </div>
              <div className="p-5">
                <h2 className="font-display text-2xl text-[var(--ag-ink)]">{b.name}</h2>
                <p className="mt-2 text-sm text-[var(--ag-muted)]">{b.description}</p>
                <p className="mt-3 text-sm text-[var(--ag-ink)]">{formatINR(b.pricePerPerson)} / person · {b.meal}</p>
              </div>
            </article>
          ))
        )}
      </div>
      {buffets.length > 0 && (
      <div className="mt-12 border border-[var(--ag-line)] bg-white/80 p-5 md:p-8">
        <h2 className="font-display text-3xl text-[var(--ag-ink)]">Reserve seats</h2>
        <div className="mt-6">
          <BuffetBookingForm buffets={buffets} contactPhone={phones.food} />
        </div>
      </div>
      )}
    </div>
  );
}
