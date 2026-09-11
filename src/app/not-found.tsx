import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 pt-24 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--hm-sea)]">
        404
      </p>
      <h1 className="mt-3 font-display text-5xl text-[var(--hm-ink)]">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-[var(--hm-muted)]">
        That path doesn’t exist at Havenmere. Head back to rooms or start a
        reservation.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button
          render={<Link href="/" />}
          className="h-11 rounded-none bg-[var(--hm-sea)] px-6 text-white hover:bg-[var(--hm-sea)]/90"
        >
          Home
        </Button>
        <Button
          render={<Link href="/rooms" />}
          variant="outline"
          className="h-11 rounded-none px-6"
        >
          Rooms
        </Button>
      </div>
    </div>
  );
}
