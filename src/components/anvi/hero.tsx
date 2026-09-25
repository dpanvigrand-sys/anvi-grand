import Image from "next/image";
import Link from "next/link";

export function Hero({
  imageSrc,
  receptionPhone = "7569494949",
  foodBrand = "IRAA Dine",
  foodLogo = "/logos/iraa-mark.svg",
}: {
  imageSrc?: string;
  receptionPhone?: string;
  foodBrand?: string;
  foodLogo?: string;
}) {
  const src = imageSrc?.trim() || "/images/anvi-entrance.jpg";
  const phone = receptionPhone.trim() || "7569494949";
  const brand = foodBrand.trim() || "IRAA Dine";
  const logo = foodLogo.trim() || "/logos/iraa-mark.svg";

  return (
    <section className="relative min-h-[100svh] overflow-hidden md:min-h-[88svh]">
      <div
        className="animate-ken-burns absolute inset-0 bg-cover bg-[center_22%] sm:bg-[center_28%]"
        style={{ backgroundImage: `url(${src})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,6,6,0.62)_0%,rgba(18,6,6,0.28)_38%,rgba(18,6,6,0.78)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(90,0,0,0.5)_0%,transparent_58%)]" />
      <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#6b0000_0%,#d4af37_50%,#6b0000_100%)]" />

      <div className="relative z-20 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-between px-5 pb-11 pt-7 md:min-h-[88svh] md:px-8 md:pb-14 md:pt-10">
        {/* One mobile composition: brand stack + IRAA accent under CTA (not side zigzag) */}
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-6">
          <div className="animate-drift w-full max-w-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--ag-gold-soft)] sm:text-[11px] sm:tracking-[0.28em]">
              Vijayawada · Benz Circle
            </p>
            <h1 className="mt-4 font-display text-[2.65rem] leading-[1.02] tracking-[0.04em] text-white sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block text-base font-normal tracking-[0.22em] text-white/85 sm:text-xl md:text-2xl">
                Welcome to
              </span>
              <span className="mt-2 block">ANVI GRAND</span>
            </h1>
            <p className="mt-4 max-w-md font-display text-lg text-[var(--ag-gold-soft)] sm:text-xl">
              Experience Luxury & Comfort
            </p>
            <p className="mt-3 max-w-lg text-[13px] leading-relaxed text-white/80 sm:text-sm md:text-base">
              Hotel stays, banquet celebrations, and IRAA Dine — near Benz Circle,
              Eluru Road. Call{" "}
              <a
                href={`tel:${phone}`}
                className="font-medium text-white underline decoration-[var(--ag-gold)] underline-offset-4"
              >
                {phone}
              </a>
            </p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/book"
                className="inline-flex h-12 w-full items-center justify-center bg-[var(--ag-gold)] px-6 text-sm font-semibold tracking-wide text-[var(--ag-red-deep)] transition hover:bg-[var(--ag-gold-soft)] sm:w-auto"
              >
                Book Your Stay
              </Link>
              <Link
                href="/banquet"
                className="inline-flex h-12 w-full items-center justify-center border border-white/70 bg-transparent px-6 text-sm font-semibold tracking-wide text-white transition hover:border-[var(--ag-gold)] hover:text-[var(--ag-gold-soft)] sm:w-auto"
              >
                Plan an Event
              </Link>
            </div>
          </div>

          {/* Desktop: IRAA opposite Welcome. Mobile: compact strip under brand (no side zigzag) */}
          <Link
            href="/food"
            className="animate-drift-delay flex w-full flex-row items-center gap-3 border-t border-white/15 pt-5 md:w-auto md:shrink-0 md:flex-col md:items-center md:gap-2 md:border-0 md:pt-0 md:text-center"
            aria-label={`${brand} — open dining menu`}
          >
            <Image
              src={logo}
              alt=""
              width={72}
              height={72}
              className="h-12 w-12 drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)] md:h-[4.5rem] md:w-[4.5rem]"
              unoptimized
              priority
            />
            <span className="flex flex-col md:items-center">
              <span className="font-display text-xl tracking-[0.16em] text-white md:text-xl">
                IRAA
              </span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--ag-gold)]">
                Dine
              </span>
            </span>
          </Link>
        </div>

        <div className="animate-drift mt-8 flex flex-col gap-3 border-t border-white/20 pt-5 text-[10px] uppercase tracking-[0.2em] text-white/70 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4 sm:text-xs sm:tracking-[0.18em] md:mt-0">
          <p>Rooms · Banquet · Party Hall · IRAA Dine</p>
          <Link href="/gallery" className="text-[var(--ag-gold-soft)] hover:text-white">
            View gallery →
          </Link>
        </div>
      </div>
    </section>
  );
}
