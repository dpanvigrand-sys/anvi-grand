"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/format";
import type { Venue, VenueBooking } from "@/lib/types";

type Props = {
  venues: Venue[];
  initial: VenueBooking[];
};

const emptyForm = {
  venueId: "",
  guestName: "",
  phone: "",
  email: "",
  address: "",
  eventDate: "",
  guests: 50,
  functionDetails: "",
  withFood: false,
  recommendPersonName: "",
  total: "",
  advance: "",
  notes: "",
};

export function VenueBookingsAdmin({ venues, initial }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [rows, setRows] = useState(initial);
  const [form, setForm] = useState({
    ...emptyForm,
    venueId: venues[0]?.id || "",
    eventDate: new Date().toISOString().slice(0, 10),
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [edit, setEdit] = useState<Partial<VenueBooking>>({});
  const [error, setError] = useState("");
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) =>
        (b.eventDate || "").localeCompare(a.eventDate || ""),
      ),
    [rows],
  );

  function create(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    start(async () => {
      const res = await fetch("/api/bookings/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          guests: Number(form.guests) || 1,
          total: form.total ? Number(form.total) : undefined,
          advance: form.advance ? Number(form.advance) : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Create failed");
        return;
      }
      setRows((r) => [data.booking as VenueBooking, ...r]);
      setForm({
        ...emptyForm,
        venueId: venues[0]?.id || "",
        eventDate: today,
      });
      router.refresh();
    });
  }

  function saveEdit(id: string) {
    setError("");
    start(async () => {
      const res = await fetch(`/api/ops/venue-bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edit),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Update failed");
        return;
      }
      setRows((list) =>
        list.map((b) => (b.id === id ? (data.booking as VenueBooking) : b)),
      );
      setEditId(null);
      setEdit({});
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={create}
        className="grid gap-3 border border-[var(--ag-line)] bg-white p-5 md:grid-cols-2"
      >
        <p className="md:col-span-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-red)]">
          Enter venue booking
        </p>
        <div className="grid gap-2">
          <Label>Venue</Label>
          <select
            className="h-10 border border-[var(--ag-line)] bg-white px-3 text-sm"
            value={form.venueId}
            onChange={(e) => setForm({ ...form, venueId: e.target.value })}
            required
          >
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} · {formatINR(v.priceFrom)}/day
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label>Event date</Label>
          <Input
            type="date"
            className="rounded-none"
            value={form.eventDate}
            onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>Guest name</Label>
          <Input
            className="rounded-none"
            value={form.guestName}
            onChange={(e) => setForm({ ...form, guestName: e.target.value })}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>Phone</Label>
          <Input
            className="rounded-none"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </div>
        <div className="grid gap-2 md:col-span-2">
          <Label>Address</Label>
          <Input
            className="rounded-none"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>
        <div className="grid gap-2 md:col-span-2">
          <Label>Function details</Label>
          <Input
            className="rounded-none"
            value={form.functionDetails}
            onChange={(e) =>
              setForm({ ...form, functionDetails: e.target.value })
            }
            placeholder="Wedding reception / corporate / birthday…"
          />
        </div>
        <div className="grid gap-2">
          <Label>Members</Label>
          <Input
            type="number"
            min={1}
            className="rounded-none"
            value={form.guests}
            onChange={(e) =>
              setForm({ ...form, guests: Number(e.target.value) || 1 })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label>Recommend person</Label>
          <Input
            className="rounded-none"
            value={form.recommendPersonName}
            onChange={(e) =>
              setForm({ ...form, recommendPersonName: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label>Total ₹</Label>
          <Input
            className="rounded-none"
            value={form.total}
            onChange={(e) => setForm({ ...form, total: e.target.value })}
            placeholder="Defaults to venue rate"
          />
        </div>
        <div className="grid gap-2">
          <Label>Advance ₹</Label>
          <Input
            className="rounded-none"
            value={form.advance}
            onChange={(e) => setForm({ ...form, advance: e.target.value })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={form.withFood}
            onChange={(e) => setForm({ ...form, withFood: e.target.checked })}
          />
          With food / IRAA Dine package
        </label>
        <div className="grid gap-2 md:col-span-2">
          <Label>Notes</Label>
          <Input
            className="rounded-none"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <Button
            type="submit"
            disabled={pending}
            className="h-11 rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
          >
            {pending ? "Saving…" : "Add booking"}
          </Button>
          {error ? (
            <p className="mt-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </form>

      <div className="border border-[var(--ag-line)] bg-white">
        <div className="border-b border-[var(--ag-line)] px-4 py-3">
          <h2 className="font-display text-2xl">Venue bookings list</h2>
          <p className="text-sm text-[var(--ag-muted)]">
            Today highlighted · balance due in maroon
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[var(--ag-line)] bg-[var(--ag-soft)] text-xs uppercase tracking-[0.12em] text-[var(--ag-muted)]">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Guest</th>
                <th className="px-3 py-2">Venue</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Balance</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-8 text-[var(--ag-muted)]"
                  >
                    No venue bookings yet.
                  </td>
                </tr>
              ) : (
                sorted.map((b) => {
                  const isToday = b.eventDate === today;
                  return (
                    <tr
                      key={b.id}
                      className={`border-b border-[var(--ag-line)] ${isToday ? "bg-[#fff5f4]" : ""}`}
                    >
                      <td className="px-3 py-3 align-top">
                        {editId === b.id ? (
                          <Input
                            type="date"
                            className="rounded-none"
                            value={String(edit.eventDate ?? b.eventDate)}
                            onChange={(e) =>
                              setEdit({ ...edit, eventDate: e.target.value })
                            }
                          />
                        ) : (
                          <>
                            <span className="font-medium">{b.eventDate}</span>
                            {isToday ? (
                              <span className="ml-2 text-xs font-semibold uppercase text-[var(--ag-red)]">
                                Today
                              </span>
                            ) : null}
                          </>
                        )}
                      </td>
                      <td className="px-3 py-3 align-top">
                        {editId === b.id ? (
                          <Input
                            className="rounded-none"
                            value={String(edit.guestName ?? b.guestName)}
                            onChange={(e) =>
                              setEdit({ ...edit, guestName: e.target.value })
                            }
                          />
                        ) : (
                          <>
                            <p className="font-medium">{b.guestName}</p>
                            <p className="text-[var(--ag-muted)]">{b.phone}</p>
                            {b.functionDetails ? (
                              <p className="text-xs text-[var(--ag-muted)]">
                                {b.functionDetails}
                              </p>
                            ) : null}
                          </>
                        )}
                      </td>
                      <td className="px-3 py-3 align-top">{b.venueName}</td>
                      <td className="px-3 py-3 align-top">
                        {editId === b.id ? (
                          <Input
                            className="rounded-none"
                            type="number"
                            value={Number(edit.total ?? b.total)}
                            onChange={(e) =>
                              setEdit({
                                ...edit,
                                total: Number(e.target.value) || 0,
                              })
                            }
                          />
                        ) : (
                          formatINR(b.total)
                        )}
                      </td>
                      <td className="px-3 py-3 align-top text-[var(--ag-maroon)]">
                        {editId === b.id ? (
                          <Input
                            className="rounded-none"
                            type="number"
                            value={Number(edit.advance ?? b.advance ?? 0)}
                            onChange={(e) =>
                              setEdit({
                                ...edit,
                                advance: Number(e.target.value) || 0,
                              })
                            }
                            placeholder="Advance"
                          />
                        ) : (
                          formatINR(b.balance ?? 0)
                        )}
                      </td>
                      <td className="px-3 py-3 align-top text-right">
                        {editId === b.id ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              className="h-8 rounded-none bg-[var(--ag-red)] px-2 text-xs text-white"
                              onClick={() => saveEdit(b.id)}
                              disabled={pending}
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-8 rounded-none px-2 text-xs"
                              onClick={() => {
                                setEditId(null);
                                setEdit({});
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="text-[var(--ag-red)] underline"
                            onClick={() => {
                              setEditId(b.id);
                              setEdit({
                                guestName: b.guestName,
                                eventDate: b.eventDate,
                                total: b.total,
                                advance: b.advance ?? 0,
                              });
                            }}
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
