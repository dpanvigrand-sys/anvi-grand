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
      <div className="absolute inset-0 bg-[linear-gradient(118deg,rgba(120,8,12,0.9)_0%,rgba(227,27,35,0.62)_40%,rgba(80,16,20,0.78)_100%)]" />
      <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_16%_20%,rgba(255,90,90,0.35),transparent_38%),radial-gradient(circle_at_84%_70%,rgba(227,27,35,0.5),transparent_44%)]" />
      <div className="absolute inset-x-0 top-0 h-2 bg-[var(--ag-red)]" />
      <div className="absolute inset-x-0 bottom-0 h-1 bg-[var(--ag-red)]" />

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
          <p className="mt-5 inline-flex bg-[var(--ag-red)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            Vijayawada · Eluru Road
          </p>
          <h1 className="animate-drift mt-5 max-w-xl font-display text-3xl leading-tight tracking-[-0.02em] text-white sm:text-4xl md:text-5xl">
            Grand stays on Eluru Road, Vijayawada.
          </h1>
          <p className="animate-drift-delay mt-4 max-w-md text-sm leading-relaxed text-white/85 md:text-base">
            Near Benz Circle — rooms from ₹3,499, banquet celebrations, party
            nights, and CHIGURU Andhra dining. Call{" "}
            <a
              href="tel:7569494949"
              className="font-semibold text-white underline decoration-[var(--ag-red)] decoration-2 underline-offset-4"
            >
              7569494949
            </a>
            .
          </p>
          <div className="animate-drift-delay-2 mt-8 flex flex-wrap gap-3">
            <Button
              render={<Link href="/book" />}
              className="h-11 rounded-none bg-[var(--ag-red)] px-6 text-white shadow-[0_8px_24px_rgba(209,31,36,0.35)] hover:bg-[var(--ag-red-deep)]"
            >
              Book a room
            </Button>
            <Button
              render={<Link href="/food" />}
              variant="outline"
              className="h-11 rounded-none border-2 border-white/80 bg-transparent px-6 text-white hover:border-white hover:bg-[var(--ag-red)] hover:text-white"
            >
              Order CHIGURU
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
