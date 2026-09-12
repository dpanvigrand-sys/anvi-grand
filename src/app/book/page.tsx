import type { Metadata } from "next";
import { RoomBookingForm } from "@/components/anvi/room-booking-form";
import { getHotel, getRooms, resolveHotelPhones } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Book a room" };
type Props = { searchParams: Promise<{ room?: string }> };

export default async function BookPage({ searchParams }: Props) {
  const { room } = await searchParams;
  const [allRooms, hotel] = await Promise.all([getRooms(), getHotel()]);
  const rooms = allRooms.filter((r) => r.available);
  const phones = resolveHotelPhones(hotel);
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:px-8">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--ag-red)]">Reservations</p>
      <h1 className="mt-3 font-display text-5xl text-[var(--ag-ink)]">Book a stay</h1>
      <p className="mt-4 text-[var(--ag-muted)]">
        Instant confirmation via local JSON store—no account needed. Rooms desk{" "}
        <a href={`tel:${phones.rooms}`} className="font-semibold text-[var(--ag-red)]">
          {phones.rooms}
        </a>
        .
      </p>
      <div className="mt-10 border border-[var(--ag-line)] bg-white/80 p-5 md:p-8">
        <RoomBookingForm
          rooms={rooms}
          defaultRoomId={room}
          contactPhone={phones.rooms}
        />
      </div>
    </div>
  );
}
