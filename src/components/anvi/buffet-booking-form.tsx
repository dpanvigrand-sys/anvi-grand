"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatINR } from "@/lib/format";
import type { Buffet } from "@/lib/types";

type Props = {
  buffets: Buffet[];
};

export function BuffetBookingForm({ buffets }: Props) {
  const [buffetId, setBuffetId] = useState(buffets[0]?.id || "");
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  const buffet = buffets.find((b) => b.id === buffetId);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setPending(true);
    try {
      const res = await fetch("/api/buffet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buffetId, guestName, phone, date, guests }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not book buffet.");
        return;
      }
      setSuccess(
        `Buffet booked · ${data.booking.id} · ${formatINR(data.booking.total)}. See you at CHIGURU.`,
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (!buffets.length) {
    return (
      <p className="border border-[var(--ag-line)] bg-white px-5 py-8 text-[var(--ag-muted)]">
        Buffet dates will open soon. Call 7569494949.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 border border-[var(--ag-line)] bg-white p-6 md:p-8">
      <div className="space-y-2">
        <Label>Buffet</Label>
        <Select value={buffetId} onValueChange={(v) => v && setBuffetId(v)}>
          <SelectTrigger className="w-full rounded-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {buffets.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name} · {formatINR(b.pricePerPerson)}/person
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="guestName">Name</Label>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guests">Guests</Label>
          <Input
            id="guests"
            type="number"
            min={1}
            required
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="rounded-none"
          />
        </div>
      </div>

      {buffet && guests > 0 && (
        <p className="text-sm text-[var(--ag-muted)]">
          Estimated total{" "}
          <span className="font-medium text-[var(--ag-chocolate)]">
            {formatINR(guests * buffet.pricePerPerson)}
          </span>
        </p>
      )}

      {error && <p className="text-sm text-[var(--ag-red)]">{error}</p>}
      {success && <p className="text-sm text-[var(--ag-maroon)]">{success}</p>}

      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
      >
        {pending ? "Booking…" : "Book buffet"}
      </Button>
    </form>
  );
}
