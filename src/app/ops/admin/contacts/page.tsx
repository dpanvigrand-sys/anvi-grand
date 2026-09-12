import Link from "next/link";
import { ContactsAdmin } from "@/components/ops/contacts-admin";
import { getHotel } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminContactsPage() {
  const hotel = await getHotel();

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-red)]">
        Admin · Contacts
      </p>
      <h1 className="mt-2 font-display text-4xl text-[var(--ag-ink)]">
        Booking phone numbers
      </h1>
      <p className="mt-2 max-w-2xl text-[var(--ag-muted)]">
        Add, edit, or clear the three public lines: Rooms booking, Food
        booking, and Reception. Guest pages at{" "}
        <Link href="/rooms" className="text-[var(--ag-red)] underline">
          /rooms
        </Link>
        ,{" "}
        <Link href="/food" className="text-[var(--ag-red)] underline">
          /food
        </Link>
        , and{" "}
        <Link href="/contact" className="text-[var(--ag-red)] underline">
          /contact
        </Link>{" "}
        update immediately.
      </p>
      <p className="mt-2 text-sm text-[var(--ag-muted)]">
        Entry: <code>/ops</code> → unlock with <code>anviops2026</code> →{" "}
        <strong>Contacts</strong>.
      </p>
      <div className="mt-8">
        <ContactsAdmin initialHotel={hotel} />
      </div>
    </div>
  );
}
