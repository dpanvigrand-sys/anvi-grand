"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { HotelInfo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = { initialHotel: HotelInfo };

export function OpeningPopupAdmin({ initialHotel }: Props) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(Boolean(initialHotel.openingPopupEnabled));
  const [title, setTitle] = useState(
    initialHotel.openingPopupTitle || "Opening Shortly",
  );
  const [message, setMessage] = useState(
    initialHotel.openingPopupMessage ||
      "ANVI GRAND near Benz Circle is getting ready for you — rooms, banquet celebrations, and IRAA Dine. Call reception to reserve your stay.",
  );
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function save(nextEnabled?: boolean) {
    setBusy(true);
    setError("");
    setStatus("");
    const on = typeof nextEnabled === "boolean" ? nextEnabled : enabled;
    try {
      const res = await fetch("/api/ops/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "hotel",
          action: "upsert",
          item: {
            openingPopupEnabled: on,
            openingPopupTitle: title.trim() || "Opening Shortly",
            openingPopupMessage: message.trim(),
          } satisfies Partial<HotelInfo>,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      const saved = data.hotel as HotelInfo;
      setEnabled(Boolean(saved.openingPopupEnabled));
      setTitle(saved.openingPopupTitle || "Opening Shortly");
      setMessage(
        saved.openingPopupMessage ||
          "ANVI GRAND near Benz Circle is getting ready for you.",
      );
      setStatus(
        saved.openingPopupEnabled
          ? "Popup ON — guests see Opening Shortly on phone & desktop."
          : "Popup OFF — guests will not see the notice.",
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="border border-[var(--ag-line)] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-[var(--ag-ink)]">
            Opening shortly popup
          </h2>
          <p className="mt-1 text-sm text-[var(--ag-muted)]">
            Rich notice on the guest website (phone & computer). Guests can
            dismiss it; turn Off anytime to hide it completely.
          </p>
        </div>
        <span
          className={`shrink-0 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
            enabled
              ? "bg-[var(--ag-gold)] text-[var(--ag-red-deep)]"
              : "bg-[var(--ag-soft)] text-[var(--ag-muted)]"
          }`}
        >
          {enabled ? "On" : "Off"}
        </span>
      </div>

      {status ? <p className="mt-3 text-sm text-emerald-700">{status}</p> : null}
      {error ? (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-4 grid gap-3">
        <div className="grid gap-1">
          <Label htmlFor="opening-title">Headline</Label>
          <Input
            id="opening-title"
            className="rounded-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="opening-message">Message</Label>
          <textarea
            id="opening-message"
            rows={3}
            className="w-full border border-[var(--ag-line)] bg-white px-3 py-2 text-sm text-[var(--ag-ink)] outline-none focus:border-[var(--ag-red)]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={busy}
          onClick={() => {
            setEnabled(true);
            void save(true);
          }}
          className="h-9 rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
        >
          Turn On
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => {
            setEnabled(false);
            void save(false);
          }}
          className="h-9 rounded-none border-[var(--ag-red)] text-[var(--ag-red)] hover:bg-[var(--ag-red)] hover:text-white"
        >
          Turn Off
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => void save()}
          className="h-9 rounded-none"
        >
          Save copy
        </Button>
      </div>
    </section>
  );
}
