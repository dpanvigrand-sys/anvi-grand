import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import { isUploadSrc } from "@/lib/media-place";
import { getHotel, getRooms, resolveHotelPhones } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Rooms" };

export default async function RoomsPage() {
  const [rooms, hotel] = await Promise.all([getRooms(), getHotel()]);
  const phones = resolveHotelPhones(hotel);
  return (
    <div className="pt-8">
      <section className="mx-auto max-w-6xl px-5 pb-10 md:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--ag-red)]">Stay</p>
        <h1 className="mt-3 font-display text-5xl text-[var(--ag-ink)]">Rooms & suites</h1>
        <p className="mt-4 max-w-2xl text-[var(--ag-muted)]">
          Four room types with AC, Wi-Fi, and Eluru Road convenience. Book online
          or call rooms desk{" "}
          <a href={`tel:${phones.rooms}`} className="font-semibold text-[var(--ag-red)]">
            {phones.rooms}
          </a>
          .
        </p>
      </section>
      <section className="mx-auto max-w-6xl px-5 pb-24 md:px-8">
        {rooms.length === 0 ? (
          <p className="border border-[var(--ag-line)] bg-white/70 px-6 py-16 text-center text-[var(--ag-muted)]">No rooms listed right now.</p>
        ) : (
          <div className="grid gap-12 md:grid-cols-2">
            {rooms.map((room) => (
              <article key={room.id}>
                <Link href={`/rooms/${room.id}`} className="relative block aspect-[4/3] overflow-hidden">
                  <Image src={room.image} alt={room.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" unoptimized={isUploadSrc(room.image)} />
                </Link>
                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-3xl text-[var(--ag-ink)]"><Link href={`/rooms/${room.id}`}>{room.name}</Link></h2>
                  <p className="text-sm text-[var(--ag-muted)]">{formatINR(room.pricePerNight)}/night</p>
                </div>
                <p className="mt-2 text-sm text-[var(--ag-muted)]">{room.tagline}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
