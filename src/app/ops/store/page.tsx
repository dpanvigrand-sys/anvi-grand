import { StationHome } from "@/components/ops/station-home";
import { computeStockOnHand } from "@/lib/ops-alerts";
import { getOps } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function StorePage() {
  const ops = await getOps();
  const onHand = computeStockOnHand(ops.inward, ops.outward);
  const low = onHand.filter((r) => r.qty <= (ops.settings.lowStockQty || 15));

  return (
    <StationHome
      stationId="store"
      ops={ops}
      stats={[
        { label: "Inward lines", value: ops.inward.length },
        { label: "Outward lines", value: ops.outward.length },
        { label: "SKUs on hand", value: onHand.length },
        { label: "Low stock", value: low.length },
      ]}
      actions={[
        {
          href: "/ops/inward",
          title: "Inward receipts",
          te: "ఇన్‌వర్డ్",
          desc: "Stock in from vendors + reports",
        },
        {
          href: "/ops/outward",
          title: "Outward issues",
          te: "అవుట్‌వర్డ్",
          desc: "Issue to kitchen, HK, departments",
        },
        {
          href: "/ops/admin/stock-reports",
          title: "Stock reports",
          te: "స్టాక్ రిపోర్ట్",
          desc: "Day / month · Excel · A4 · JPG",
        },
        {
          href: "/ops/accounts/purchases?type=groceries",
          title: "Grocery purchases",
          te: "కిరాణా",
          desc: "Purchase book — groceries",
        },
        {
          href: "/ops/accounts/purchases?type=ingredients",
          title: "Kitchen ingredients",
          te: "వంట పదార్థాలు",
          desc: "Purchase book — ingredients",
        },
        {
          href: "/ops/accounts/purchases?type=housekeeping",
          title: "HK supplies",
          te: "HK సామాను",
          desc: "Housekeeping purchase links",
        },
      ]}
    >
      <h2 className="font-display text-2xl">On-hand snapshot</h2>
      <div className="mt-4 overflow-x-auto border border-[var(--ag-line)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--ag-line)] bg-[var(--ag-soft)] text-xs uppercase tracking-[0.12em] text-[var(--ag-muted)]">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Unit</th>
            </tr>
          </thead>
          <tbody>
            {onHand.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-[var(--ag-muted)]">
                  No stock movements yet — add inward first.
                </td>
              </tr>
            ) : (
              onHand.map((r) => (
                <tr
                  key={`${r.item}-${r.unit}`}
                  className={`border-b border-[var(--ag-line)] ${
                    r.qty <= (ops.settings.lowStockQty || 15) ? "bg-[#fff7ed]" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium">{r.item}</td>
                  <td className="px-4 py-3">{r.qty}</td>
                  <td className="px-4 py-3">{r.unit}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </StationHome>
  );
}
