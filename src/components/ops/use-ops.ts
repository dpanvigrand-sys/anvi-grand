"use client";

import { useCallback, useEffect, useState } from "react";
import type { OpsStore } from "@/lib/types";

export function useOps() {
  const [ops, setOps] = useState<OpsStore | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/ops", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load ops");
      setOps(await res.json());
    } catch {
      setError("Could not load ops data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ops, error, loading, refresh };
}
