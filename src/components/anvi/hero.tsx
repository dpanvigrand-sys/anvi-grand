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
    <section className="relative min-h-[calc(100svh-6.25rem)] overflow-hidden md:min-h-[88svh]">
      <div
        className="animate-ken-burns absolute inset-0 bg-cover bg-[center_20%] sm:bg-[center_28%]"
        style={{ backgroundImage: `url(${src})` }}
        aria-hidden
      />
      {/* Richer phone readability: deeper veil + warm side wash */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,4,4,0.72)_0%,rgba(14,4,4,0.35)_36%,rgba(14,4,4,0.82)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(90,0,0,0.55)_0%,transparent_52%)]" />
      <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#6b0000_0%,#d4af37_50%,#6b0000_100%)]" />

      <div className="relative z-20 mx-auto flex min-h-[calc(100svh-6.25rem)] w-full max-w-6xl flex-col justify-between px-5 pb-8 pt-6 md:min-h-[88svh] md:px-8 md:pb-14 md:pt-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-6">
          <div className="animate-drift w-full max-w-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--ag-gold-soft)]">
              Vijayawada · Benz Circle
            </p>
            <h1 className="mt-5 font-display text-[2.75rem] leading-[0.98] tracking-[0.05em] text-white sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block text-[0.95rem] font-normal tracking-[0.24em] text-white/80 sm:text-xl md:text-2xl">
                Welcome to
              </span>
              <span className="mt-2.5 block">ANVI GRAND</span>
            </h1>
            <p className="mt-5 max-w-md font-display text-[1.15rem] leading-snug text-[var(--ag-gold-soft)] sm:text-xl">
              Experience Luxury & Comfort
            </p>
            <p className="mt-3 max-w-md text-[13px] leading-relaxed text-white/80 sm:text-sm md:text-base">
              Hotel stays, banquet celebrations, and IRAA Dine near Benz Circle.
              Call{" "}
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
                className="inline-flex h-12 w-full items-center justify-center bg-[linear-gradient(180deg,#e8c76a_0%,#d4af37_55%,#c49a2a_100%)] px-6 text-sm font-semibold tracking-wide text-[var(--ag-red-deep)] shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition hover:brightness-105 sm:w-auto"
              >
                Book Your Stay
              </Link>
              <Link
                href="/banquet"
                className="inline-flex h-12 w-full items-center justify-center border border-[var(--ag-gold)]/70 bg-white/5 px-6 text-sm font-semibold tracking-wide text-white backdrop-blur-[2px] transition hover:border-[var(--ag-gold)] hover:bg-white/10 sm:w-auto"
              >
                Plan an Event
              </Link>
            </div>
          </div>

          {/* Mobile: quiet IRAA strip. Desktop: mark opposite Welcome */}
          <Link
            href="/food"
            className="animate-drift-delay flex w-full flex-row items-center gap-3 rounded-sm border border-white/10 bg-black/20 px-3 py-3 backdrop-blur-[2px] md:w-auto md:shrink-0 md:flex-col md:items-center md:gap-2 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none md:text-center"
            aria-label={`${brand} — open dining menu`}
          >
            <Image
              src={logo}
              alt=""
              width={72}
              height={72}
              className="h-11 w-11 drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)] md:h-[4.5rem] md:w-[4.5rem]"
              unoptimized
              priority
            />
            <span className="flex flex-col md:items-center">
              <span className="font-display text-lg tracking-[0.16em] text-white md:text-xl">
                IRAA
              </span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--ag-gold)]">
                Dine
              </span>
            </span>
          </Link>
        </div>

        <div className="animate-drift mt-6 flex flex-col gap-2.5 border-t border-[var(--ag-gold)]/25 pt-4 text-[10px] uppercase tracking-[0.2em] text-white/65 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4 sm:text-xs sm:tracking-[0.18em] md:mt-0">
          <p>Rooms · Banquet · Party Hall · IRAA Dine</p>
          <Link href="/gallery" className="text-[var(--ag-gold-soft)] hover:text-white">
            View gallery →
          </Link>
        </div>
      </div>
    </section>
  );
}
