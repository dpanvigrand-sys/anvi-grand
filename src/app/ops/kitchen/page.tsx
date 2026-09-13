import { StationHome } from "@/components/ops/station-home";
import { StatusActions } from "@/components/ops/status-actions";
import { getOps } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function KitchenPage() {
  const ops = await getOps();
  const open = ops.kitchenTickets.filter((t) => t.status !== "bumped");
  const queued = open.filter((t) => t.status === "queued").length;
  const cooking = open.filter((t) => t.status === "cooking").length;
  const ready = open.filter((t) => t.status === "ready").length;

  return (
    <StationHome
      stationId="kitchen"
      ops={ops}
      stats={[
        { label: "Queued", value: queued },
        { label: "Cooking", value: cooking },
        { label: "Ready", value: ready },
        { label: "Open tickets", value: open.length },
      ]}
      actions={[
        {
          href: "/ops/server",
          title: "Server floor",
          te: "సర్వర్",
          desc: "Table status for plating / serve",
        },
        {
          href: "/ops/store",
          title: "Store / ingredients",
          te: "స్టోర్",
          desc: "Check outward issues when stock runs low",
        },
        {
          href: "/ops/manager",
          title: "Restaurant manager",
          te: "మేనేజర్",
          desc: "Escalate food alerts and menu questions",
        },
        {
          href: "/ops/admin/food",
          title: "Menu CMS",
          te: "మెనూ",
          desc: "Dish names and prep notes",
        },
      ]}
    >
      <h2 className="font-display text-2xl">Ticket queue · టికెట్ క్యూ</h2>
      <div className="mt-4 space-y-4">
        {open.length === 0 ? (
          <p className="border border-[var(--ag-line)] bg-white px-5 py-10 text-[var(--ag-muted)]">
            Kitchen is clear.
          </p>
        ) : (
          open.map((t) => (
            <article key={t.id} className="border border-[var(--ag-line)] bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--ag-muted)]">
                    {t.status} · {t.id}
                  </p>
                  <ul className="mt-2 text-sm text-[var(--ag-ink)]">
                    {t.items.map((i) => (
                      <li key={i.menuId}>
                        {i.qty}× {i.name}
                      </li>
                    ))}
                  </ul>
                  {t.tableId ? (
                    <p className="mt-2 text-sm text-[var(--ag-muted)]">
                      Table {t.tableId}
                    </p>
                  ) : null}
                </div>
                <StatusActions
                  endpoint={`/api/ops/kitchen/${t.id}`}
                  statuses={[
                    { value: "queued", label: "Queue" },
                    { value: "cooking", label: "Cook" },
                    { value: "ready", label: "Ready" },
                    { value: "bumped", label: "Bump" },
                  ]}
                />
              </div>
            </article>
          ))
        )}
      </div>
    </StationHome>
  );
}
