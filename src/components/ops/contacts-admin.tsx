"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { HotelInfo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RoleKey = "roomsPhone" | "foodPhone" | "receptionPhone";

const ROLES: {
  key: RoleKey;
  title: string;
  hint: string;
  guest: string;
}[] = [
  {
    key: "roomsPhone",
    title: "Rooms booking",
    hint: "Shown on /rooms and room booking help text",
    guest: "/rooms",
  },
  {
    key: "foodPhone",
    title: "Food booking",
    hint: "Shown on /food (IRAA Dine) ordering pages",
    guest: "/food",
  },
  {
    key: "receptionPhone",
    title: "Reception",
    hint: "Header, footer, contact page, and general desk",
    guest: "/contact · header · footer",
  },
];

type Props = { initialHotel: HotelInfo };

export function ContactsAdmin({ initialHotel }: Props) {
  const router = useRouter();
  const [hotel, setHotel] = useState(initialHotel);
  const [drafts, setDrafts] = useState<Record<RoleKey, string>>({
    roomsPhone: initialHotel.roomsPhone || initialHotel.phone || "",
    foodPhone: initialHotel.foodPhone || initialHotel.phone || "",
    receptionPhone: initialHotel.receptionPhone || initialHotel.phone || "",
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function savePatch(patch: Partial<HotelInfo>, okMsg: string) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/ops/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "hotel", action: "upsert", item: patch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      const saved = data.hotel as HotelInfo;
      setHotel(saved);
      setDrafts({
        roomsPhone: saved.roomsPhone || "",
        foodPhone: saved.foodPhone || "",
        receptionPhone: saved.receptionPhone || "",
      });
      setMessage(okMsg);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  function saveRole(key: RoleKey) {
    const value = drafts[key].trim();
    if (!value) {
      setError("Enter a phone number, or use Clear to remove this role line.");
      return;
    }
    const patch: Partial<HotelInfo> = { [key]: value };
    // Keep legacy phone in sync with reception when reception is saved
    if (key === "receptionPhone") patch.phone = value;
    void savePatch(
      patch,
      `Saved ${ROLES.find((r) => r.key === key)?.title} → ${value}. Guest pages update live.`,
    );
  }

  function clearRole(key: RoleKey) {
    if (
      !window.confirm(
        "Clear this role number? Guest pages will fall back to the main desk number until you add one again.",
      )
    ) {
      return;
    }
    void savePatch(
      { [key]: "" },
      `Cleared ${ROLES.find((r) => r.key === key)?.title}. Fallback is ${hotel.phone}.`,
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--ag-muted)]">
        Manage the three public booking lines. Main desk fallback stays{" "}
        <strong>{hotel.phone || "7569494949"}</strong> unless you change
        Reception.
      </p>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4">
        {ROLES.map((role) => {
          const live = hotel[role.key]?.trim() || "";
          return (
            <section
              key={role.key}
              id={`contact-${role.key}`}
              className="border border-[var(--ag-line)] bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl text-[var(--ag-ink)]">
                    {role.title}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--ag-muted)]">
                    {role.hint}
                  </p>
                  <p className="mt-1 text-xs text-[var(--ag-muted)]">
                    Guest: {role.guest}
                    {live ? (
                      <>
                        {" "}
                        · Live:{" "}
                        <a
                          href={`tel:${live}`}
                          className="font-semibold text-[var(--ag-red)]"
                        >
                          {live}
                        </a>
                      </>
                    ) : (
                      <> · using fallback {hotel.phone}</>
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <div className="grid min-w-[220px] flex-1 gap-1">
                  <Label htmlFor={role.key}>Phone number</Label>
                  <Input
                    id={role.key}
                    className="rounded-none"
                    inputMode="tel"
                    placeholder="7569494949"
                    value={drafts[role.key]}
                    onChange={(e) =>
                      setDrafts((d) => ({ ...d, [role.key]: e.target.value }))
                    }
                  />
                </div>
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => saveRole(role.key)}
                  className="h-9 rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
                >
                  {live ? "Save" : "Add"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy || !live}
                  onClick={() => clearRole(role.key)}
                  className="h-9 rounded-none border-[var(--ag-red)] text-[var(--ag-red)] hover:bg-[var(--ag-red)] hover:text-white"
                >
                  Delete
                </Button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
