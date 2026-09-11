import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/hotel/hero";
import { RoomPreview } from "@/components/hotel/room-preview";
import { Button } from "@/components/ui/button";
import { getRooms } from "@/lib/store";

export default async function HomePage() {
  const rooms = await getRooms();
  const featured = rooms.slice(0, 3);

  return (
    <>
      <Hero />

      <section className="mx-auto w-full max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl animate-drift">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--hm-sea)]">
            The house
          </p>
          <h2 className="mt-3 font-display text-4xl text-[var(--hm-ink)] md:text-5xl">
            Built for long weekends and soft landings.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--hm-muted)] md:text-lg">
            Havenmere sits between cedar forest and open water. Guests come for
            the quiet—and stay for the dining room, the morning mist, and rooms
            that feel like a private cabin with a better mattress.
          </p>
        </div>
      </section>

      <section className="border-y border-[var(--hm-line)] bg-white/50">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center md:gap-16 md:px-8 md:py-24">
          <div className="relative aspect-[4/5] overflow-hidden md:aspect-[5/6]">
            <Image
              src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80"
              alt="Havenmere lobby lounge overlooking the lake"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="animate-drift-delay">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--hm-sea)]">
              Stay
            </p>
            <h2 className="mt-3 font-display text-4xl text-[var(--hm-ink)] md:text-5xl">
              Sixteen rooms. One shoreline.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--hm-muted)]">
              From the Lake Suite’s glass wall to the freestanding Meadow
              Cottage, every room faces water, trees, or both. Reserve online—
              confirmation is instant in this local demo.
            </p>
            <Button
              render={<Link href="/rooms" />}
              className="mt-8 h-11 rounded-none bg-[var(--hm-sea)] px-6 text-white hover:bg-[var(--hm-sea)]/90"
            >
              Browse rooms
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--hm-sea)]">
              Rooms
            </p>
            <h2 className="mt-3 font-display text-4xl text-[var(--hm-ink)]">
              A few places to begin
            </h2>
          </div>
          <Link
            href="/rooms"
            className="text-sm text-[var(--hm-sea)] underline-offset-4 hover:underline"
          >
            See all rooms
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="border border-[var(--hm-line)] bg-white/70 px-6 py-10 text-center text-[var(--hm-muted)]">
            Rooms are being refreshed. Please check back shortly.
          </p>
        ) : (
          <div className="grid gap-10 md:grid-cols-3">
            {featured.map((room) => (
              <RoomPreview key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80)",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-[var(--hm-deep)]/70" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-5 px-5 py-24 md:px-8 md:py-32">
          <h2 className="max-w-xl font-display text-4xl text-white md:text-5xl">
            Ready for the lake?
          </h2>
          <p className="max-w-md text-white/75">
            Choose dates, pick a room, and receive a confirmation number on the
            spot.
          </p>
          <Button
            render={<Link href="/book" />}
            className="h-11 rounded-none bg-white px-6 text-[var(--hm-ink)] hover:bg-white/90"
          >
            Start a reservation
          </Button>
        </div>
      </section>
    </>
  );
}
