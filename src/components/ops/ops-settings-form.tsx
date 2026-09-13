"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OPS_STATIONS } from "@/lib/ops-stations";
import type { OpsSettings, OpsStationId } from "@/lib/types";

type Props = { initial: OpsSettings };

export function OpsSettingsForm({ initial }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [form, setForm] = useState(initial);
  const [msg, setMsg] = useState("");

  function setField<K extends keyof OpsSettings>(key: K, value: OpsSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setStationLabel(id: OpsStationId, part: "en" | "te", value: string) {
    setForm((f) => ({
      ...f,
      stationLabels: {
        ...(f.stationLabels || {}),
        [id]: {
          en: f.stationLabels?.[id]?.en || "",
          te: f.stationLabels?.[id]?.te || "",
          ...f.stationLabels?.[id],
          [part]: value,
        },
      },
    }));
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    start(async () => {
      const res = await fetch("/api/ops/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        setMsg("Save failed.");
        return;
      }
      setMsg("Saved · సేవ్ అయింది");
      router.refresh();
    });
  }

  return (
    <form onSubmit={save} className="space-y-8">
      <div className="grid gap-4 border border-[var(--ag-line)] bg-white p-5 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="hotelNameLine">Hotel name line</Label>
          <Input
            id="hotelNameLine"
            className="rounded-none"
            value={form.hotelNameLine}
            onChange={(e) => setField("hotelNameLine", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="foodBrandLine">Food brand line</Label>
          <Input
            id="foodBrandLine"
            className="rounded-none"
            value={form.foodBrandLine}
            onChange={(e) => setField("foodBrandLine", e.target.value)}
          />
        </div>
        <div className="grid gap-2 md:col-span-2">
          <Label htmlFor="opsPasswordNote">Ops password note</Label>
          <Input
            id="opsPasswordNote"
            className="rounded-none"
            value={form.opsPasswordNote}
            onChange={(e) => setField("opsPasswordNote", e.target.value)}
          />
          <p className="text-xs text-[var(--ag-muted)]">
            Demo unlock stays <code>anviops2026</code> unless changed in code.
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lowStockQty">Low stock alert qty</Label>
          <Input
            id="lowStockQty"
            type="number"
            min={0}
            className="rounded-none"
            value={form.lowStockQty}
            onChange={(e) => setField("lowStockQty", Number(e.target.value) || 0)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="banquetReminderHours">Banquet reminder hours</Label>
          <Input
            id="banquetReminderHours"
            type="number"
            min={1}
            className="rounded-none"
            value={form.banquetReminderHours}
            onChange={(e) =>
              setField("banquetReminderHours", Number(e.target.value) || 24)
            }
          />
        </div>
      </div>

      <div className="border border-[var(--ag-line)] bg-white p-5">
        <h2 className="font-display text-2xl text-[var(--ag-ink)]">
          Station labels (optional overrides)
        </h2>
        <p className="mt-1 text-sm text-[var(--ag-muted)]">
          Leave blank to keep defaults. Telugu + English shown on hub cards.
        </p>
        <div className="mt-4 space-y-3">
          {OPS_STATIONS.map((s) => (
            <div
              key={s.id}
              className="grid gap-2 border border-[var(--ag-line)] p-3 md:grid-cols-[140px_1fr_1fr]"
            >
              <p className="text-sm font-medium text-[var(--ag-ink)]">
                {s.clientLabel}
              </p>
              <Input
                className="rounded-none"
                placeholder={s.en}
                value={form.stationLabels?.[s.id]?.en || ""}
                onChange={(e) => setStationLabel(s.id, "en", e.target.value)}
              />
              <Input
                className="rounded-none"
                placeholder={s.te}
                value={form.stationLabels?.[s.id]?.te || ""}
                onChange={(e) => setStationLabel(s.id, "te", e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          disabled={pending}
          className="h-11 rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
        >
          {pending ? "Saving…" : "Save settings"}
        </Button>
        {msg ? <p className="text-sm text-[var(--ag-maroon)]">{msg}</p> : null}
      </div>
    </form>
  );
}
