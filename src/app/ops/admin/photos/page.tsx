import Link from "next/link";
import { PhotoManager } from "@/components/ops/photo-manager";
import { getMedia } from "@/lib/media";

export const dynamic = "force-dynamic";

export default async function AdminPhotosPage() {
  const items = await getMedia({ sync: true });

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-red)]">
        Admin · Media
      </p>
      <h1 className="mt-2 font-display text-4xl text-[var(--ag-ink)]">
        Photo manager
      </h1>
      <p className="mt-2 max-w-2xl text-[var(--ag-muted)]">
        Add or delete gallery and website photos here. Guest gallery at{" "}
        <Link href="/gallery" className="text-[var(--ag-red)] underline">
          /gallery
        </Link>{" "}
        reads this library. Hero uses the photo marked with slot{" "}
        <strong>hero</strong>.
      </p>
      <p className="mt-2 text-sm text-[var(--ag-muted)]">
        Entry: <code>/ops</code> → unlock → <strong>Photos</strong> (or Admin →
        Photo manager).
      </p>
      <div className="mt-8">
        <PhotoManager initialItems={items} />
      </div>
    </div>
  );
}
