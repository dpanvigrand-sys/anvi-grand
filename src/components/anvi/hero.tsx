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

      {/* Top-left hero copy — brand + bold welcome */}
      <div className="relative mx-auto flex min-h-[72svh] w-full max-w-6xl flex-col items-start justify-start px-5 pb-16 pt-10 text-left md:min-h-[82svh] md:px-8 md:pb-24 md:pt-14">
        <div className="max-w-xl text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/anvi-grand.svg"
            alt="ANVI GRAND"
            className="mb-5 h-14 w-auto drop-shadow-lg md:mb-6 md:h-16"
          />
          <h1 className="animate-drift font-sans text-4xl font-normal leading-[1.1] tracking-tight text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.55)] sm:text-5xl md:text-6xl">
            Welcome to Anvi Grand
          </h1>
          <p className="animate-drift-delay mt-3 text-left text-lg font-semibold text-[var(--ag-gold)] [text-shadow:0_1px_10px_rgba(0,0,0,0.45)] sm:text-xl md:text-2xl">
            Experience Luxury & Comfort
          </p>
          <p className="mt-4 max-w-md text-left text-sm text-white/85 md:text-base">
            Near Benz Circle, Eluru Road, Vijayawada · Call{" "}
            <a
              href="tel:7569494949"
              className="font-semibold text-white underline decoration-[var(--ag-gold)] underline-offset-4"
            >
              7569494949
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
