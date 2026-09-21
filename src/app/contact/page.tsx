import type { Metadata } from "next";
import { ContactForm } from "@/components/anvi/contact-form";
import { MapEmbed } from "@/components/anvi/map-embed";
import { getHotel, resolveHotelPhones } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const hotel = await getHotel();
  const phones = resolveHotelPhones(hotel);

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 py-12 md:grid-cols-[0.9fr_1.1fr] md:px-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--ag-red)]">
          Contact
        </p>
        <h1 className="mt-3 font-display text-5xl text-[var(--ag-ink)]">
          Anvi Grand
        </h1>
        <p className="mt-4 text-[var(--ag-muted)]">
          Questions on rooms, banquet, party hall, or IRAA catering—call the
          right desk or write to us near Benz Circle, Eluru Road.
        </p>
        <div className="mt-8 space-y-4 text-sm text-[var(--ag-ink)]">
          <p>
            <span className="block text-xs uppercase tracking-[0.16em] text-[var(--ag-muted)]">
              Reception
            </span>
            <a href={`tel:${phones.reception}`} className="text-lg font-semibold text-[var(--ag-red)]">
              {phones.reception}
            </a>
          </p>
          <p>
            <span className="block text-xs uppercase tracking-[0.16em] text-[var(--ag-muted)]">
              Rooms booking
            </span>
            <a href={`tel:${phones.rooms}`} className="text-lg font-semibold text-[var(--ag-red)]">
              {phones.rooms}
            </a>
          </p>
          <p>
            <span className="block text-xs uppercase tracking-[0.16em] text-[var(--ag-muted)]">
              Food booking
            </span>
            <a href={`tel:${phones.food}`} className="text-lg font-semibold text-[var(--ag-red)]">
              {phones.food}
            </a>
          </p>
          <p>
            <span className="block text-xs uppercase tracking-[0.16em] text-[var(--ag-muted)]">
              Email
            </span>
            {hotel.email}
          </p>
          <p>
            <span className="block text-xs uppercase tracking-[0.16em] text-[var(--ag-muted)]">
              Address
            </span>
            {hotel.address}
          </p>
        </div>
        <div className="mt-8 overflow-hidden rounded-lg ring-1 ring-black/10">
          <div className="aspect-[4/3] min-h-[220px] w-full sm:min-h-[280px]">
            <MapEmbed className="h-full min-h-[220px] sm:min-h-[280px]" />
          </div>
          <a
            href="https://maps.app.goo.gl/F5K19Sff5QfKbEZs5"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-[var(--ag-red)] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[var(--ag-red-deep)]"
          >
            Open Anvi Grand in Google Maps
          </a>
        </div>
      </div>
      <div className="border border-[var(--ag-line)] bg-white/80 p-5 md:p-8">
        <ContactForm />
      </div>
    </div>
  );
}
