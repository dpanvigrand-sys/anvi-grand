import type { Metadata } from "next";
import { RoomPreview } from "@/components/hotel/room-preview";
import { getRooms } from "@/lib/store";

export const metadata: Metadata = {
  title: "Rooms",
  description: "Browse Havenmere rooms and suites overlooking the lake and forest.",
};

export default async function RoomsPage() {
  const rooms = await getRooms();

  return (
    <div className="pt-24">
      <section className="mx-auto w-full max-w-6xl px-5 pb-10 pt-8 md:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--hm-sea)]">
          Accommodations
        </p>
        <h1 className="mt-3 font-display text-5xl text-[var(--hm-ink)] md:text-6xl">
          Rooms & suites
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--hm-muted)]">
          Four room types across the property—each with its own outlook, pace,
          and evening light.
        </p>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-24 md:px-8">
        {rooms.length === 0 ? (
          <div className="border border-[var(--hm-line)] bg-white/70 px-6 py-16 text-center">
            <p className="font-display text-3xl text-[var(--hm-ink)]">
              No rooms listed
            </p>
            <p className="mt-2 text-sm text-[var(--hm-muted)]">
              Inventory could not be loaded. Refresh the page or try again soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-12 md:grid-cols-2">
            {rooms.map((room) => (
              <RoomPreview key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
