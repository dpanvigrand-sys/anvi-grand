import Image from "next/image";
import Link from "next/link";
import { FoodOrderForm } from "@/components/anvi/food-order-form";
import { Hero } from "@/components/anvi/hero";
import { formatINR } from "@/lib/format";
import { getHotel, getMenu, getRooms, getVenues } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [hotel, rooms, venues, menu] = await Promise.all([
    getHotel(),
    getRooms(),
    getVenues(),
    getMenu(),
  ]);

  const stayRoom =
    rooms.find((r) => r.id === "executive-red-suite") || rooms[0];
  const banquetHalls = venues.filter(
    (v) => v.type === "banquet" || v.type === "party-hall",
  ).slice(0, 2);

  return (
    <>
      <Hero imageSrc={hotel.heroImage} />

      <section className="bg-[var(--ag-soft)] py-14 md:py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 md:grid-cols-3 md:px-8">
          {stayRoom && (
            <article className="overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-black/5">
              <div className="relative aspect-[4/3]">
                <Image
                  src={stayRoom.image}
                  alt={stayRoom.name}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 33vw"
                  priority
                />
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-red)]">
                  Stay at Anvi Grand
                </p>
                <h2 className="mt-2 font-display text-2xl text-[var(--ag-ink)]">
                  {stayRoom.name}
                </h2>
                <p className="mt-2 text-sm font-semibold text-[var(--ag-ink)]">
                  {formatINR(stayRoom.pricePerNight)}{" "}
                  <span className="font-normal text-[var(--ag-muted)]">/ night</span>
                </p>
                <p className="mt-1 text-sm text-[var(--ag-muted)]">
                  {stayRoom.amenities.slice(0, 3).join(" · ")}
                </p>
                <Link
                  href={`/rooms/${stayRoom.id}`}
                  className="mt-5 flex h-11 items-center justify-center rounded-md bg-[var(--ag-red)] text-sm font-semibold text-white hover:bg-[var(--ag-red-deep)]"
                >
                  Book Room
                </Link>
              </div>
            </article>
          )}

          {banquetHalls.map((venue) => (
            <article
              key={venue.id}
              className="overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-black/5"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={venue.image}
                  alt={venue.name}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-red)]">
                  Book Banquet Halls
                </p>
                <h2 className="mt-2 font-display text-2xl text-[var(--ag-ink)]">
                  {venue.name}
                </h2>
                <p className="mt-2 text-sm font-semibold text-[var(--ag-ink)]">
                  {formatINR(venue.priceFrom)}{" "}
                  <span className="font-normal text-[var(--ag-muted)]">/ Day</span>
                </p>
                <p className="mt-1 text-sm text-[var(--ag-muted)]">
                  Capacity: {venue.capacity} Guests
                </p>
                <Link
                  href={venue.type === "banquet" ? "/banquet" : "/party-hall"}
                  className="mt-5 flex h-11 items-center justify-center rounded-md bg-[var(--ag-red)] text-sm font-semibold text-white hover:bg-[var(--ag-red-deep)]"
                >
                  Reserve Banquet Hall
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="dining" className="bg-white py-14 md:py-20">
        <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
          <h2 className="font-display text-3xl text-[var(--ag-red)] md:text-4xl">
            Order from CHIGURU Restaurant
          </h2>
          <p className="mt-2 max-w-2xl text-[var(--ag-muted)]">
            Andhra favourites with clear ₹ pricing. Add to cart and pay through
            Anvi Grand checkout — tickets land on the kitchen board instantly.
          </p>
          <div className="mt-8">
            <FoodOrderForm menu={menu} variant="home" />
          </div>
          <p className="mt-6 text-sm text-[var(--ag-muted)]">
            Full menu on{" "}
            <Link href="/food" className="font-medium text-[var(--ag-red)] hover:underline">
              the CHIGURU dining page
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
