export function Hero() {
  return (
    <section className="relative min-h-[72svh] overflow-hidden md:min-h-[82svh]">
      <div
        className="animate-ken-burns absolute inset-0 bg-cover bg-[center_28%]"
        style={{ backgroundImage: "url(/images/anvi-entrance.jpg)" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(90,0,0,0.58)_0%,rgba(26,18,16,0.28)_50%,rgba(0,0,0,0.2)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#8b0000_0%,#d4af37_50%,#8b0000_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />

      {/* True top-left corner — normal weight only */}
      <div className="absolute top-4 left-4 z-10 max-w-xl text-left md:top-6 md:left-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/anvi-grand.svg"
          alt="ANVI GRAND"
          className="mb-3 h-12 w-auto drop-shadow-lg md:mb-4 md:h-14"
        />
        <h1
          className="animate-drift font-sans text-4xl font-normal leading-[1.1] tracking-tight text-white !font-[400] [text-shadow:0_2px_18px_rgba(0,0,0,0.55)] sm:text-5xl md:text-6xl"
          style={{ fontWeight: 400 }}
        >
          Welcome to Anvi Grand
        </h1>
        <p
          className="animate-drift-delay mt-2 text-left text-lg font-normal text-[var(--ag-gold)] !font-[400] [text-shadow:0_1px_10px_rgba(0,0,0,0.45)] sm:text-xl md:text-2xl"
          style={{ fontWeight: 400 }}
        >
          Experience Luxury & Comfort
        </p>
        <p
          className="mt-3 max-w-md text-left text-sm font-normal text-white/85 !font-[400] md:text-base"
          style={{ fontWeight: 400 }}
        >
          Near Benz Circle, Eluru Road, Vijayawada · Call{" "}
          <a
            href="tel:7569494949"
            className="font-normal text-white underline decoration-[var(--ag-gold)] underline-offset-4"
            style={{ fontWeight: 400 }}
          >
            7569494949
          </a>
        </p>
      </div>
    </section>
  );
}
