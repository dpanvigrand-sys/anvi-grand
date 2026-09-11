import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <div
        className="absolute inset-0 animate-ken-burns bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80)",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(42,18,12,0.82)_0%,rgba(107,15,26,0.48)_48%,rgba(74,44,26,0.68)_100%)]" />
      <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_18%_22%,rgba(255,250,247,0.16),transparent_34%),radial-gradient(circle_at_82%_68%,rgba(155,27,30,0.28),transparent_42%)]" />

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-end px-5 pb-16 pt-36 md:px-8 md:pb-24">
        <div className="max-w-2xl">
          <Image
            src="/logos/anvi-grand.svg"
            alt="ANVI GRAND"
            width={280}
            height={72}
            className="h-14 w-auto drop-shadow md:h-16"
            priority
          />
          <p className="sr-only">ANVI GRAND</p>
          <h1 className="animate-drift mt-6 max-w-xl font-display text-3xl leading-tight tracking-[-0.02em] text-white sm:text-4xl md:text-5xl">
            Grand stays on Eluru Road, Vijayawada.
          </h1>
          <p className="animate-drift-delay mt-4 max-w-md text-sm leading-relaxed text-white/78 md:text-base">
            Near Benz Circle — rooms from ₹3,499, banquet celebrations, party
            nights, and CHIGURU Andhra dining. Call{" "}
            <a href="tel:7569494949" className="underline decoration-white/40 underline-offset-4">
              7569494949
            </a>
            .
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
