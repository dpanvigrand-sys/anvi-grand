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
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,28,36,0.72)_0%,rgba(8,28,36,0.35)_45%,rgba(8,28,36,0.55)_100%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(90,160,150,0.22),transparent_40%)]" />

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-end px-5 pb-16 pt-28 md:px-8 md:pb-24">
        <div className="max-w-2xl animate-rise">
          <p className="font-display text-5xl leading-[0.95] tracking-[-0.02em] text-white sm:text-6xl md:text-7xl lg:text-8xl">
            Havenmere
          </p>
          <h1 className="mt-5 max-w-xl text-lg font-medium leading-snug text-white/92 sm:text-xl md:text-2xl">
            Lakeside nights, unhurried mornings.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 md:text-base">
            A boutique hotel on Maine’s north shore—sixteen rooms, a quiet
            dining room, and water at the edge of every walk.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              render={<Link href="/book" />}
              className="h-11 rounded-none bg-white px-6 text-[var(--hm-ink)] hover:bg-white/90"
            >
              Reserve a stay
            </Button>
            <Button
              render={<Link href="/rooms" />}
              variant="outline"
              className="h-11 rounded-none border-white/50 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
            >
              View rooms
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
