import Link from "next/link";
import { FoodAdmin } from "@/components/ops/food-admin";
import { getBuffets, getMenu } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminFoodPage() {
  const [menu, buffets] = await Promise.all([getMenu(), getBuffets()]);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-red)]">
        Admin · Food
      </p>
      <h1 className="mt-2 font-display text-4xl text-[var(--ag-ink)]">
        CHIGURU menu & buffets
      </h1>
      <p className="mt-2 max-w-2xl text-[var(--ag-muted)]">
        Full item edit (name, description, category, veg, price, image), plus quick Save ₹,
        add, and delete. Public pages at{" "}
        <Link href="/food" className="text-[var(--ag-red)] underline">
          /food
        </Link>{" "}
        and{" "}
        <Link href="/buffet" className="text-[var(--ag-red)] underline">
          /buffet
        </Link>{" "}
        read <code>data/catalog.json</code> live.
      </p>
      <p className="mt-2 text-sm text-[var(--ag-muted)]">
        Entry: <code>/ops</code> → unlock with <code>anviops2026</code> →{" "}
        <strong>Food</strong>.
      </p>
      <div className="mt-8">
        <FoodAdmin initialMenu={menu} initialBuffets={buffets} />
      </div>
    </div>
  );
}
