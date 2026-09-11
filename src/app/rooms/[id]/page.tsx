import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { getRoomById, getRooms } from "@/lib/store";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const rooms = await getRooms();
  return rooms.map((room) => ({ id: room.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const room = await getRoomById(id);
  if (!room) return { title: "Room not found" };
  return {
    title: room.name,
    description: room.tagline,
  };
}

export default async function RoomDetailPage({ params }: Props) {
  const { id } = await params;
  const room = await getRoomById(id);
  if (!room) notFound();

  return (
    <div>
      <section className="relative h-[55vh] min-h-[320px] w-full overflow-hidden md:h-[65vh]">
        <Image
          src={room.image}
          alt={room.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--hm-deep)]/70 via-transparent to-[var(--hm-deep)]/25" />
        <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-6xl px-5 pb-10 md:px-8">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">
            {formatCurrency(room.pricePerNight)} / night
          </p>
          <h1 className="mt-2 font-display text-5xl text-white md:text-6xl">
            {room.name}
          </h1>
          <p className="mt-3 max-w-xl text-white/80">{room.tagline}</p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-14 md:grid-cols-[1.4fr_0.8fr] md:px-8 md:py-20">
        <div>
          <h2 className="font-display text-3xl text-[var(--hm-ink)]">
            About this room
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--hm-muted)]">
            {room.description}
          </p>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[var(--hm-ink)]">
            <li>Sleeps {room.capacity}</li>
            <li>{room.sizeSqFt} sq ft</li>
            {room.amenities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <aside className="border border-[var(--hm-line)] bg-white/80 p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--hm-muted)]">
            From
          </p>
          <p className="font-display text-4xl text-[var(--hm-ink)]">
            {formatCurrency(room.pricePerNight)}
            <span className="text-base text-[var(--hm-muted)]"> / night</span>
          </p>
          <p className="mt-3 text-sm text-[var(--hm-muted)]">
            {room.available
              ? "Available for online reservation."
              : "Temporarily unavailable."}
          </p>
          <Button
            render={<Link href={`/book?room=${room.id}`} />}
            disabled={!room.available}
            className="mt-6 h-11 w-full rounded-none bg-[var(--hm-sea)] text-white hover:bg-[var(--hm-sea)]/90"
          >
            Book this room
          </Button>
          <Link
            href="/rooms"
            className="mt-4 block text-center text-sm text-[var(--hm-sea)] underline-offset-4 hover:underline"
          >
            Back to all rooms
          </Link>
        </aside>
      </section>
    </div>
  );
}
