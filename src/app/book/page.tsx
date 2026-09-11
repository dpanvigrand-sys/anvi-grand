import type { Metadata } from "next";
import { BookingForm } from "@/components/hotel/booking-form";
import { getRooms } from "@/lib/store";

export const metadata: Metadata = {
  title: "Book a stay",
  description: "Reserve a room at Havenmere. Instant local confirmation.",
};

type Props = {
  searchParams: Promise<{ room?: string }>;
};

export default async function BookPage({ searchParams }: Props) {
  const { room: roomParam } = await searchParams;
  const rooms = await getRooms();
  const available = rooms.filter((room) => room.available);
  const initialRoomId =
    available.find((room) => room.id === roomParam)?.id ?? available[0]?.id;

  return (
    <div className="pt-24">
      <section className="mx-auto w-full max-w-3xl px-5 pb-24 pt-8 md:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--hm-sea)]">
          Reservations
        </p>
        <h1 className="mt-3 font-display text-5xl text-[var(--hm-ink)] md:text-6xl">
          Book a stay
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--hm-muted)]">
          Choose your room and dates. Bookings are stored locally in{" "}
          <code className="text-[var(--hm-ink)]">data/bookings.json</code> for
          this demo—no account required.
        </p>

        <div className="mt-10 border border-[var(--hm-line)] bg-white/75 p-5 md:p-8">
          <BookingForm rooms={available} initialRoomId={initialRoomId} />
        </div>
      </section>
    </div>
  );
}
