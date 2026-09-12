import Link from "next/link";
import { RoomsAdmin } from "@/components/ops/rooms-admin";
import { getRooms } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminRoomsPage() {
  const rooms = await getRooms();

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-red)]">
        Admin · Rooms
      </p>
      <h1 className="mt-2 font-display text-4xl text-[var(--ag-ink)]">
        Room rates & catalog
      </h1>
      <p className="mt-2 max-w-2xl text-[var(--ag-muted)]">
        Change nightly prices in ₹, add or remove rooms. Public pages at{" "}
        <Link href="/rooms" className="text-[var(--ag-red)] underline">
          /rooms
        </Link>{" "}
        read <code>data/catalog.json</code> live.
      </p>
      <p className="mt-2 text-sm text-[var(--ag-muted)]">
        Entry: <code>/ops</code> → unlock with <code>anviops2026</code> →{" "}
        <strong>Rooms</strong>.
      </p>
      <div className="mt-8">
        <RoomsAdmin initialRooms={rooms} />
      </div>
    </div>
  );
}
