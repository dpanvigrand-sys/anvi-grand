"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * After CMS / ops saves on another tab or by an agent, F5 already shows fresh
 * HTML (force-dynamic + no-store). This also soft-refreshes when the tab
 * becomes visible again, and lightly polls so open screens stay current.
 */
export function LiveDataRefresh({
  intervalMs = 45_000,
}: {
  intervalMs?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    let last = 0;
    const tick = () => {
      const now = Date.now();
      if (now - last < 4_000) return;
      last = now;
      try {
        router.refresh();
      } catch {
        /* ignore */
      }
    };

    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };
    const onFocus = () => tick();

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") tick();
    }, intervalMs);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
      window.clearInterval(id);
    };
  }, [router, intervalMs]);

  return null;
}
