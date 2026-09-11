import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-xl flex-col items-start justify-center gap-4 px-5 py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--ag-red)]">404</p>
      <h1 className="font-display text-3xl text-[var(--ag-chocolate)]">
        Page not found at ANVI GRAND
      </h1>
      <p className="text-[var(--ag-muted)]">
        That link may have moved. Head home or call 7569494949.
      </p>
      <Button
        render={<Link href="/" />}
        className="mt-2 h-10 rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
      >
        Back to home
      </Button>
    </div>
  );
}
