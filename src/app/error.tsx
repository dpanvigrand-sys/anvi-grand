"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 pt-10 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--hm-sea)]">
        Error
      </p>
      <h1 className="mt-3 font-display text-4xl text-[var(--hm-ink)] md:text-5xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-sm text-[var(--hm-muted)]">
        {error.message || "An unexpected error occurred while loading this page."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button
          onClick={reset}
          className="h-11 rounded-none bg-[var(--hm-sea)] px-6 text-white hover:bg-[var(--hm-sea)]/90"
        >
          Try again
        </Button>
        <Button
          render={<Link href="/" />}
          variant="outline"
          className="h-11 rounded-none px-6"
        >
          Home
        </Button>
      </div>
    </div>
  );
}
