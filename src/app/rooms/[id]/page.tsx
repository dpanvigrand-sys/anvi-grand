import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatINR } from "@/lib/format";
import { getRoom, getRooms } from "@/lib/store";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return (await getRooms()).map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const room = await getRoom((await params).id);
  return { title: room?.name ?? "Room" };
}

export default async function RoomDetailPage({ params }: Props) {
  const room = await getRoom((await params).id);
  if (!room) notFound();
  return (
    <div>
      <section className="relative h-[55vh] min-h-[320px] w-full overflow-hidden md:h-[65vh]">
        <Image src={room.image} alt={room.name} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ag-chocolate)]/75 via-transparent to-[var(--ag-chocolate)]/30" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-5 pb-10 md:px-8">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">{formatINR(room.pricePerNight)} / night</p>
          <h1 className="mt-2 font-display text-5xl text-white md:text-6xl">{room.name}</h1>
          <p className="mt-3 max-w-xl text-white/80">{room.tagline}</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-14 md:grid-cols-[1.4fr_0.8fr] md:px-8">
        <div>
          <h2 className="font-display text-3xl text-[var(--ag-ink)]">About this room</h2>
          <p className="mt-4 leading-relaxed text-[var(--ag-muted)]">{room.description}</p>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[var(--ag-ink)]">
            <li>Sleeps {room.capacity}</li>
            {room.amenities.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
        <aside className="border border-[var(--ag-line)] bg-white/80 p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--ag-muted)]">From</p>
          <p className="font-display text-4xl text-[var(--ag-ink)]">{formatINR(room.pricePerNight)}<span className="text-base text-[var(--ag-muted)]"> / night</span></p>
          <Link href={`/book?room=${room.id}`} className="mt-6 inline-flex h-11 w-full items-center justify-center bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]">Book this room</Link>
          <Link href="/rooms" className="mt-4 block text-center text-sm text-[var(--ag-red)] underline-offset-4 hover:underline">Back to rooms</Link>
        </aside>
      </section>
    </div>
  );
}
