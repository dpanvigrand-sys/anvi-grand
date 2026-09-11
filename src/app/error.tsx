"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-xl flex-col items-start justify-center gap-4 px-5 py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--ag-red)]">Something went wrong</p>
      <h1 className="font-display text-3xl text-[var(--ag-chocolate)]">
        ANVI GRAND hit a snag
      </h1>
      <p className="text-[var(--ag-muted)]">
        Please try again, or call the front desk on 7569494949.
      </p>
      <Button
        onClick={reset}
        className="mt-2 h-10 rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
      >
        Try again
      </Button>
    </div>
  );
}
