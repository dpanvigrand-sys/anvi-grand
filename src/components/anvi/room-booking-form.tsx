"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatINR, nightsBetween } from "@/lib/format";
import type { Room } from "@/lib/types";

type Props = {
  rooms: Room[];
  defaultRoomId?: string;
  contactPhone?: string;
};

export function RoomBookingForm({
  rooms,
  defaultRoomId,
  contactPhone = "7569494949",
}: Props) {
  const desk = contactPhone.trim() || "7569494949";
  const router = useRouter();
  const available = rooms.filter((r) => r.available);
  const [roomId, setRoomId] = useState(defaultRoomId || available[0]?.id || "");
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [advance, setAdvance] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const room = useMemo(() => available.find((r) => r.id === roomId), [available, roomId]);
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const total = room && nights > 0 ? nights * room.pricePerNight : 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const res = await fetch("/api/bookings/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          guestName,
          email,
          phone,
          address,
          advance,
          checkIn,
          checkOut,
          guests,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not complete booking.");
        return;
      }
      router.push(`/bookings/${data.booking.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (!available.length) {
    return (
      <p className="border border-[var(--ag-line)] bg-white px-5 py-8 text-[var(--ag-muted)]">
        No rooms available right now. Please call{" "}
        <a href={`tel:${desk}`} className="font-semibold text-[var(--ag-red)]">
          {desk}
        </a>
        .
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 border border-[var(--ag-line)] bg-white p-6 md:p-8">
      <div className="space-y-2">
        <Label htmlFor="room">Room</Label>
        <Select value={roomId} onValueChange={(v) => v && setRoomId(v)}>
          <SelectTrigger id="room" className="w-full rounded-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {available.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name} · {formatINR(r.pricePerNight)}/night
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="guestName">Guest name</Label>
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
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="rounded-none"
          rows={2}
          placeholder="Street, area, city"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="checkIn">Check-in</Label>
          <Input
            id="checkIn"
            type="date"
            required
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="rounded-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="checkOut">Check-out</Label>
          <Input
            id="checkOut"
            type="date"
            required
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="rounded-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guests">Guests</Label>
          <Input
            id="guests"
            type="number"
            min={1}
            max={room?.capacity ?? 4}
            required
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="rounded-none"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="advance">Advance paid (₹)</Label>
          <Input
            id="advance"
            type="number"
            min={0}
            step={100}
            value={advance}
            onChange={(e) => setAdvance(Number(e.target.value) || 0)}
            className="rounded-none"
          />
        </div>
        <div className="space-y-2">
          <Label>Balance due</Label>
          <p className="flex h-9 items-center border border-[var(--ag-line)] bg-[#fff8f7] px-3 text-sm text-[var(--ag-ink)]">
            {nights > 0 && room
              ? formatINR(Math.max(0, total - advance))
              : "—"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-none"
          rows={3}
        />
      </div>

      {nights > 0 && room && (
        <p className="text-sm text-[var(--ag-muted)]">
          {nights} night{nights === 1 ? "" : "s"} · estimated{" "}
          <span className="font-medium text-[var(--ag-chocolate)]">{formatINR(total)}</span>
          {advance > 0 ? (
            <>
              {" "}
              · advance {formatINR(advance)} · balance{" "}
              {formatINR(Math.max(0, total - advance))}
            </>
          ) : null}
        </p>
      )}

      {error && <p className="text-sm text-[var(--ag-red)]">{error}</p>}

      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
      >
        {pending ? "Booking…" : "Confirm reservation"}
      </Button>
    </form>
  );
}
