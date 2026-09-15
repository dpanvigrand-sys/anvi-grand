import type { Metadata } from "next";
import Image from "next/image";
import { getFacilities } from "@/lib/store";

export const metadata: Metadata = { title: "Facilities" };

export default async function FacilitiesPage() {
  const facilities = await getFacilities();
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--ag-red)]">Hotel</p>
      <h1 className="mt-3 font-display text-5xl text-[var(--ag-ink)]">Facilities</h1>
      <p className="mt-4 max-w-2xl text-[var(--ag-muted)]">Pool, spa, gym, and secure parking for Anvi Grand guests.</p>
      <div className="mt-12 grid gap-10 md:grid-cols-2">
        {facilities.length === 0 ? (
          <p className="col-span-full rounded-lg border border-[var(--ag-line)] bg-white px-6 py-16 text-center text-[var(--ag-muted)]">
            Facilities details will appear here soon.
          </p>
        ) : (
          facilities.map((f) => (
            <article key={f.id}>
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image src={f.image} alt={f.name} fill className="object-cover" sizes="50vw" />
              </div>
              <h2 className="mt-4 font-display text-3xl text-[var(--ag-ink)]">{f.name}</h2>
              <p className="mt-2 text-[var(--ag-muted)]">{f.description}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
