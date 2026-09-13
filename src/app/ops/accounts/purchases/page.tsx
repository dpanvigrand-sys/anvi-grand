import { Suspense } from "react";
import { PurchasesAdmin } from "@/components/ops/accounts/purchases-admin";
import { getOps } from "@/lib/store";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{ type?: string }>;
};

export default async function PurchasesPage({ searchParams }: Props) {
  const ops = await getOps();
  const sp = searchParams ? await searchParams : {};
  return (
    <Suspense fallback={<p className="text-[var(--ag-muted)]">Loading purchases…</p>}>
      <PurchasesAdmin initialRows={ops.purchases} initialType={sp.type} />
    </Suspense>
  );
}
