import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateLabel } from "@/lib/format";
import { getBookingById } from "@/lib/store";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Confirmation ${id}` };
}

export default async function BookingConfirmationPage({ params }: Props) {
  const { id } = await params;
  const booking = await getBookingById(id);
  if (!booking) notFound();

  return (
    <div className="pt-24">
      <section className="mx-auto w-full max-w-2xl px-5 pb-24 pt-10 md:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--hm-sea)]">
          Confirmed
        </p>
        <h1 className="mt-3 font-display text-5xl text-[var(--hm-ink)]">
          You’re booked.
        </h1>
        <p className="mt-4 text-base text-[var(--hm-muted)]">
          Confirmation{" "}
          <span className="font-medium text-[var(--hm-ink)]">{booking.id}</span>{" "}
          · status {booking.status}
        </p>

        <dl className="mt-10 grid gap-5 border border-[var(--hm-line)] bg-white/80 p-6 text-sm md:p-8">
          <div className="grid gap-1 sm:grid-cols-[140px_1fr]">
            <dt className="text-[var(--hm-muted)]">Guest</dt>
            <dd className="text-[var(--hm-ink)]">
              {booking.guestName}
              <br />
              {booking.email}
              {booking.phone ? (
                <>
                  <br />
                  {booking.phone}
                </>
              ) : null}
            </dd>
          </div>
          <div className="grid gap-1 sm:grid-cols-[140px_1fr]">
            <dt className="text-[var(--hm-muted)]">Room</dt>
            <dd className="text-[var(--hm-ink)]">{booking.roomName}</dd>
          </div>
          <div className="grid gap-1 sm:grid-cols-[140px_1fr]">
            <dt className="text-[var(--hm-muted)]">Dates</dt>
            <dd className="text-[var(--hm-ink)]">
              {formatDateLabel(booking.checkIn)} →{" "}
              {formatDateLabel(booking.checkOut)}
              <br />
              {booking.nights} night{booking.nights === 1 ? "" : "s"} ·{" "}
              {booking.guests} guest{booking.guests === 1 ? "" : "s"}
            </dd>
          </div>
          <div className="grid gap-1 sm:grid-cols-[140px_1fr]">
            <dt className="text-[var(--hm-muted)]">Total</dt>
            <dd className="font-display text-2xl text-[var(--hm-ink)]">
              {formatCurrency(booking.totalPrice)}
            </dd>
          </div>
          {booking.notes ? (
            <div className="grid gap-1 sm:grid-cols-[140px_1fr]">
              <dt className="text-[var(--hm-muted)]">Notes</dt>
              <dd className="text-[var(--hm-ink)]">{booking.notes}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            render={<Link href="/rooms" />}
            className="h-11 rounded-none bg-[var(--hm-sea)] px-6 text-white hover:bg-[var(--hm-sea)]/90"
          >
            Browse more rooms
          </Button>
          <Button
            render={<Link href="/" />}
            variant="outline"
            className="h-11 rounded-none px-6"
          >
            Back home
          </Button>
        </div>
      </section>
    </div>
  );
}
