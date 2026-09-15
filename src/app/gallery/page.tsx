import type { Metadata } from "next";
import Image from "next/image";
import { getMedia } from "@/lib/media";
import { isUploadSrc } from "@/lib/media-place";
import { getFacilities, getHotel, getRooms, getVenues } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const [hotel, rooms, venues, facilities, media] = await Promise.all([
    getHotel(),
    getRooms(),
    getVenues(),
    getFacilities(),
    getMedia(),
  ]);

  const catalogShots = [
    {
      src: hotel.heroImage?.trim() || "/images/anvi-entrance.jpg",
      label: `Night entrance · ${hotel.name}`,
      group: "Hotel",
    },
    ...rooms
      .filter((r) => r.image)
      .map((r) => ({ src: r.image, label: r.name, group: "Rooms" })),
    ...venues
      .filter((v) => v.image)
      .map((v) => ({ src: v.image, label: v.name, group: "Venues" })),
    ...facilities
      .filter((f) => f.image)
      .map((f) => ({
        src: f.image,
        label: f.name,
        group: "Facilities",
      })),
  ];

  const managedShots = media
    .filter((m) => m.src)
    .map((m) => ({
      src: m.src,
      label: m.label,
      group: m.group,
    }));

  // Media library first (includes site placements), then any catalog leftovers
  const seen = new Set<string>();
  const shots = [...managedShots, ...catalogShots].filter((s) => {
    if (!s.src || seen.has(s.src)) return false;
    seen.add(s.src);
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ag-red)]">
        Gallery
      </p>
      <h1 className="mt-3 font-display text-4xl text-[var(--ag-ink)] md:text-5xl">
        ANVI GRAND in frames
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--ag-muted)]">
        Rooms, banquet halls, CHIGURU dining spaces, and hotel facilities near
        Benz Circle, Eluru Road, Vijayawada.
      </p>
      {shots.length === 0 ? (
        <p className="mt-10 rounded-lg border border-[var(--ag-line)] bg-white px-6 py-16 text-center text-[var(--ag-muted)]">
          Gallery photos are being prepared. Call reception or visit Anvi Grand
          near Benz Circle.
        </p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shots.map((shot) => (
            <figure
              key={`${shot.group}-${shot.label}-${shot.src}`}
              className="overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-black/5"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={shot.src}
                  alt={shot.label}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 33vw"
                  unoptimized={isUploadSrc(shot.src)}
                />
              </div>
              <figcaption className="px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--ag-red)]">
                  {shot.group}
                </p>
                <p className="mt-1 font-medium text-[var(--ag-ink)]">{shot.label}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
