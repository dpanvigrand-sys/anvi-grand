import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDateLabel, formatINR } from "@/lib/format";
import { getRoomBooking } from "@/lib/store";

type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Booking ${(await params).id}` };
}

export default async function BookingConfirmationPage({ params }: Props) {
  const booking = await getRoomBooking((await params).id);
  if (!booking) notFound();
  return (
    <div className="mx-auto max-w-2xl px-5 py-14 md:px-8">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--ag-red)]">Confirmed</p>
      <h1 className="mt-3 font-display text-5xl text-[var(--ag-ink)]">You&apos;re booked.</h1>
      <p className="mt-4 text-[var(--ag-muted)]">Confirmation <span className="text-[var(--ag-ink)]">{booking.id}</span> · {booking.status}</p>
      <dl className="mt-10 grid gap-5 border border-[var(--ag-line)] bg-white/80 p-6 text-sm md:p-8">
        <div className="grid gap-1 sm:grid-cols-[140px_1fr]"><dt className="text-[var(--ag-muted)]">Guest</dt><dd>{booking.guestName}<br />{booking.email}<br />{booking.phone}</dd></div>
        <div className="grid gap-1 sm:grid-cols-[140px_1fr]"><dt className="text-[var(--ag-muted)]">Room</dt><dd>{booking.roomName}</dd></div>
        <div className="grid gap-1 sm:grid-cols-[140px_1fr]"><dt className="text-[var(--ag-muted)]">Dates</dt><dd>{formatDateLabel(booking.checkIn)} → {formatDateLabel(booking.checkOut)}<br />{booking.nights} nights · {booking.guests} guests</dd></div>
        <div className="grid gap-1 sm:grid-cols-[140px_1fr]"><dt className="text-[var(--ag-muted)]">Total</dt><dd className="font-display text-2xl">{formatINR(booking.total)}</dd></div>
      </dl>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/rooms" className="inline-flex h-11 items-center bg-[var(--ag-red)] px-6 text-white">Browse rooms</Link>
        <Link href="/" className="inline-flex h-11 items-center border border-[var(--ag-line)] px-6">Home</Link>
      </div>
    </div>
  );
}
