import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <div
        className="absolute inset-0 animate-ken-burns bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80)",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(42,18,12,0.78)_0%,rgba(107,15,26,0.45)_48%,rgba(74,44,26,0.62)_100%)]" />
      <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_18%_22%,rgba(255,250,247,0.16),transparent_34%),radial-gradient(circle_at_82%_68%,rgba(155,27,30,0.28),transparent_42%)]" />

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-end px-5 pb-16 pt-28 md:px-8 md:pb-24">
        <div className="max-w-2xl">
          <p className="animate-drift font-display text-5xl leading-[0.95] tracking-[-0.02em] text-white sm:text-6xl md:text-7xl lg:text-8xl">
            ANVI GRAND
          </p>
          <h1 className="animate-drift-delay mt-5 max-w-xl text-lg font-medium leading-snug text-white/92 sm:text-xl md:text-2xl">
            Grand stays on Eluru Road, Vijayawada.
          </h1>
          <p className="animate-drift-delay-2 mt-4 max-w-md text-sm leading-relaxed text-white/75 md:text-base">
            Near Benz Circle — rooms, banquet, party hall, and CHIGURU dining under
            one roof. Call 7569494949.
          </p>
          <div className="animate-drift-delay-2 mt-8 flex flex-wrap gap-3">
            <Button
              render={<Link href="/book" />}
              className="h-11 rounded-none bg-white px-6 text-[var(--ag-chocolate)] hover:bg-white/90"
            >
              Book a room
            </Button>
            <Button
              render={<Link href="/food" />}
              variant="outline"
              className="h-11 rounded-none border-white/50 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
            >
              Order CHIGURU
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
