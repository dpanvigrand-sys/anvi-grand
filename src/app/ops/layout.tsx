import { OpsNav } from "@/components/ops/ops-nav";

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--ag-cream-white)]">
      <OpsNav />
      <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">{children}</div>
    </div>
  );
}
