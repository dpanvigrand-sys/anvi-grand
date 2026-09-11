"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatINR } from "@/lib/format";
import type { Venue } from "@/lib/types";

type Props = {
  venue: Venue;
};

export function VenueBookingForm({ venue }: Props) {
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [guests, setGuests] = useState(50);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setPending(true);
    try {
      const res = await fetch("/api/bookings/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueId: venue.id,
          guestName,
          email,
          phone,
          eventDate,
          guests,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not book venue.");
        return;
      }
      setSuccess(
        `Confirmed · ${data.booking.id}. Our events desk will call you on ${phone}.`,
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 border border-[var(--ag-line)] bg-white p-6 md:p-8">
      <div>
        <p className="font-display text-2xl text-[var(--ag-chocolate)]">{venue.name}</p>
        <p className="mt-1 text-sm text-[var(--ag-muted)]">
          From {formatINR(venue.priceFrom)} · up to {venue.capacity} guests
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="guestName">Host name</Label>
          <Input
            id="guestName"
            required
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="rounded-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="eventDate">Event date</Label>
          <Input
            id="eventDate"
            type="date"
            required
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="rounded-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guests">Expected guests</Label>
          <Input
            id="guests"
            type="number"
            min={1}
            max={venue.capacity}
            required
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="rounded-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Event notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-none"
          rows={3}
          placeholder="Wedding, reception, corporate dinner…"
        />
      </div>

      {error && <p className="text-sm text-[var(--ag-red)]">{error}</p>}
      {success && <p className="text-sm text-[var(--ag-maroon)]">{success}</p>}

      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
      >
        {pending ? "Submitting…" : "Request booking"}
      </Button>
    </form>
  );
}
