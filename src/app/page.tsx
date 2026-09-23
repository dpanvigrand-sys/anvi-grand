import Image from "next/image";
import Link from "next/link";
import { FoodOrderForm } from "@/components/anvi/food-order-form";
import { Hero } from "@/components/anvi/hero";
import { formatINR } from "@/lib/format";
import { isUploadSrc } from "@/lib/media-place";
import { getHotel, getMenu, getRooms, getVenues, resolveHotelPhones } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [hotel, rooms, venues, menu] = await Promise.all([
    getHotel(),
    getRooms(),
    getVenues(),
    getMenu(),
  ]);
  const phones = resolveHotelPhones(hotel);

  const stayRoom =
    rooms.find((r) => r.id === "executive-red-suite") || rooms[0];
  const banquetHalls = venues.filter(
    (v) => v.type === "banquet" || v.type === "party-hall",
  ).slice(0, 2);

  return (
    <>
      <Hero
        imageSrc={hotel.heroImage}
        receptionPhone={phones.reception}
        foodBrand={hotel.foodBrand}
        foodLogo={
          hotel.foodLogo?.includes("iraa")
            ? "/logos/iraa-mark.svg"
            : hotel.foodLogo || "/logos/iraa-mark.svg"
        }
      />

      {/* Official intro */}
      <section className="border-b border-[var(--ag-line)] bg-white py-14 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-[1.2fr_1fr] md:items-end md:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--ag-red)]">
              Hotel Anvi Grand
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-[var(--ag-ink)] md:text-4xl">
              A landmark stay near Benz Circle
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-[var(--ag-muted)] md:text-base">
            Quiet rooms, celebration halls, and IRAA Dine under one roof —
            crafted for business travellers, families, and festive gatherings in
            Vijayawada.
          </p>
        </div>
      </section>

      {/* Offerings */}
      <section className="bg-[linear-gradient(180deg,#faf8f6_0%,#f3f1ef_100%)] py-14 md:py-20">
        <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--ag-red)]">
                Stay & celebrate
              </p>
              <h2 className="mt-2 font-display text-3xl text-[var(--ag-ink)] md:text-4xl">
                Our signature spaces
              </h2>
            </div>
            <Link
              href="/rooms"
              className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--ag-red)] hover:underline"
            >
              All rooms →
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {stayRoom && (
              <article className="group">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={stayRoom.image}
                    alt={stayRoom.name}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                    sizes="(max-width:768px) 100vw, 33vw"
                    priority
                    unoptimized={isUploadSrc(stayRoom.image)}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ag-gold-soft)]">
                      Stay
                    </p>
                    <h3 className="mt-1 font-display text-2xl text-white">{stayRoom.name}</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-[var(--ag-ink)]">
                    {formatINR(stayRoom.pricePerNight)}{" "}
                    <span className="font-normal text-[var(--ag-muted)]">/ night</span>
                  </p>
                  <p className="mt-1 text-sm text-[var(--ag-muted)]">
                    {stayRoom.amenities.slice(0, 3).join(" · ")}
                  </p>
                  <Link
                    href={`/rooms/${stayRoom.id}`}
                    className="mt-4 inline-flex h-11 items-center justify-center bg-[var(--ag-red)] px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[var(--ag-red-deep)]"
                  >
                    Book Room
                  </Link>
                </div>
              </article>
            )}

            {banquetHalls.map((venue) => (
              <article key={venue.id} className="group">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={venue.image}
                    alt={venue.name}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                    sizes="(max-width:768px) 100vw, 33vw"
                    unoptimized={isUploadSrc(venue.image)}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ag-gold-soft)]">
                      {venue.type === "banquet" ? "Banquet" : "Party hall"}
                    </p>
                    <h3 className="mt-1 font-display text-2xl text-white">{venue.name}</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-[var(--ag-ink)]">
                    {formatINR(venue.priceFrom)}{" "}
                    <span className="font-normal text-[var(--ag-muted)]">/ day</span>
                  </p>
                  <p className="mt-1 text-sm text-[var(--ag-muted)]">
                    Capacity {venue.capacity} guests
                  </p>
                  <Link
                    href={venue.type === "banquet" ? "/banquet" : "/party-hall"}
                    className="mt-4 inline-flex h-11 items-center justify-center bg-[var(--ag-red)] px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[var(--ag-red-deep)]"
                  >
                    {venue.type === "banquet" ? "Reserve Banquet" : "Book Party Hall"}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="dining"
        className="border-t border-[var(--ag-gold)]/30 bg-[linear-gradient(180deg,#fff_0%,#fff8f6_100%)] py-14 md:py-20"
      >
        <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--ag-red)]">
              Dining
            </p>
            <h2 className="mt-2 font-display text-3xl text-[var(--ag-ink)] md:text-4xl">
              IRAA Dine
            </h2>
            <p className="mt-3 text-[var(--ag-muted)]">
              Andhra favourites with clear ₹ pricing. Order to your room or takeaway —
              kitchen tickets update instantly.
            </p>
          </div>
          <div className="mt-8">
            <FoodOrderForm menu={menu} variant="home" contactPhone={phones.food} />
          </div>
          <p className="mt-6 text-sm text-[var(--ag-muted)]">
            Full menu on{" "}
            <Link href="/food" className="font-medium text-[var(--ag-red)] hover:underline">
              the IRAA Dine page
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
