import Link from "next/link";
import { PhotoManager } from "@/components/ops/photo-manager";
import { getMedia } from "@/lib/media";

export const dynamic = "force-dynamic";

export default async function AdminPhotosPage() {
  const items = await getMedia({ sync: true });

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-red)]">
        Admin · Photos
      </p>
      <h1 className="mt-2 font-display text-4xl text-[var(--ag-ink)]">
        Website photo places
      </h1>
      <p className="mt-2 max-w-2xl text-[var(--ag-muted)]">
        Add, edit, or delete every public image: home hero, gallery, room cards,
        CHIGURU food, banquet/venues, and facilities. Each card shows which guest
        page it maps to. Changes update{" "}
        <Link href="/" className="text-[var(--ag-red)] underline">
          /
        </Link>
        ,{" "}
        <Link href="/gallery" className="text-[var(--ag-red)] underline">
          /gallery
        </Link>
        ,{" "}
        <Link href="/rooms" className="text-[var(--ag-red)] underline">
          /rooms
        </Link>
        , and{" "}
        <Link href="/food" className="text-[var(--ag-red)] underline">
          /food
        </Link>{" "}
        immediately.
      </p>
      <p className="mt-2 text-sm text-[var(--ag-muted)]">
        Entry: <code>/ops</code> → unlock with <code>anviops2026</code> →{" "}
        <strong>Photos</strong>.
      </p>
      <div className="mt-8">
        <PhotoManager initialItems={items} />
      </div>
    </div>
  );
}
