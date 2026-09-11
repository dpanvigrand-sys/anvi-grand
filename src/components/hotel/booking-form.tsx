"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Room } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

type Props = {
  rooms: Room[];
  initialRoomId?: string;
};

function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const ms = end.getTime() - start.getTime();
  if (Number.isNaN(ms) || ms <= 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function BookingForm({ rooms, initialRoomId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [roomId, setRoomId] = useState(initialRoomId ?? rooms[0]?.id ?? "");
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [notes, setNotes] = useState("");

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === roomId),
    [rooms, roomId],
  );
  const nights = nightsBetween(checkIn, checkOut);
  const estimate =
    selectedRoom && nights > 0 ? nights * selectedRoom.pricePerNight : 0;

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId,
            guestName,
            email,
            phone,
            checkIn,
            checkOut,
            guests: Number(guests),
            notes,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error ?? "Something went wrong. Please try again.");
          return;
        }
        router.push(`/bookings/${data.booking.id}`);
      } catch {
        setError("Network error. Check your connection and try again.");
      }
    });
  }

  if (rooms.length === 0) {
    return (
      <div className="border border-[var(--hm-line)] bg-white/60 p-8 text-center">
        <p className="font-display text-2xl text-[var(--hm-ink)]">
          No rooms available
        </p>
        <p className="mt-2 text-sm text-[var(--hm-muted)]">
          Our inventory is empty right now. Please check back soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="room">Room</Label>
        <select
          id="room"
          required
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="flex h-10 w-full rounded-none border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name} — {formatCurrency(room.pricePerNight)}/night
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="checkIn">Check-in</Label>
          <Input
            id="checkIn"
            type="date"
            required
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="rounded-none bg-white"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="checkOut">Check-out</Label>
          <Input
            id="checkOut"
            type="date"
            required
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="rounded-none bg-white"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="guestName">Full name</Label>
          <Input
            id="guestName"
            required
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="rounded-none bg-white"
            placeholder="Alex Rivera"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-none bg-white"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-none bg-white"
            placeholder="+1 207 555 0148"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="guests">Guests</Label>
          <Input
            id="guests"
            type="number"
            min={1}
            max={selectedRoom?.capacity ?? 4}
            required
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="rounded-none bg-white"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">Requests</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-24 rounded-none bg-white"
          placeholder="Late arrival, dietary notes, celebration…"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--hm-line)] pt-5">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--hm-muted)]">
            Estimated total
          </p>
          <p className="font-display text-3xl text-[var(--hm-ink)]">
            {estimate > 0 ? formatCurrency(estimate) : "—"}
          </p>
          {nights > 0 && selectedRoom ? (
            <p className="text-sm text-[var(--hm-muted)]">
              {nights} night{nights === 1 ? "" : "s"} ·{" "}
              {formatCurrency(selectedRoom.pricePerNight)}/night
            </p>
          ) : null}
        </div>
        <Button
          type="submit"
          disabled={pending}
          className="h-11 rounded-none bg-[var(--hm-sea)] px-8 text-white hover:bg-[var(--hm-sea)]/90"
        >
          {pending ? "Confirming…" : "Confirm reservation"}
        </Button>
      </div>

      {error ? (
        <p
          role="alert"
          className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
