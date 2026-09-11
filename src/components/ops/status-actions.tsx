"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function StatusActions({
  endpoint,
  statuses,
}: {
  endpoint: string;
  statuses: { value: string; label: string }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function patch(status: string) {
    setBusy(status);
    setError("");
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Update failed");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((s) => (
        <Button
          key={s.value}
          type="button"
          size="sm"
          disabled={!!busy}
          onClick={() => patch(s.value)}
          className="rounded-none bg-[var(--ag-chocolate)] text-white hover:bg-[var(--ag-maroon)]"
        >
          {busy === s.value ? "…" : s.label}
        </Button>
      ))}
      {error ? <p className="w-full text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
