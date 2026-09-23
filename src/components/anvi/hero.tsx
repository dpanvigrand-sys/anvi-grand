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
    <section className="relative min-h-[78svh] overflow-hidden md:min-h-[88svh]">
      <div
        className="animate-ken-burns absolute inset-0 bg-cover bg-[center_28%]"
        style={{ backgroundImage: `url(${src})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,8,8,0.55)_0%,rgba(20,8,8,0.25)_42%,rgba(20,8,8,0.72)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(90,0,0,0.45)_0%,transparent_55%)]" />
      <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#6b0000_0%,#d4af37_50%,#6b0000_100%)]" />

      <div className="relative z-20 mx-auto flex min-h-[78svh] w-full max-w-6xl flex-col justify-between px-5 pb-10 pt-8 md:min-h-[88svh] md:px-8 md:pb-14 md:pt-10">
        <div className="flex items-start justify-between gap-4">
          <div className="animate-drift max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--ag-gold-soft)]">
              Vijayawada · Benz Circle
            </p>
            <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-[0.04em] text-white sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block text-lg font-normal tracking-[0.2em] text-white/85 sm:text-xl md:text-2xl">
                Welcome to
              </span>
              <span className="mt-1 block">ANVI GRAND</span>
            </h1>
            <p className="mt-4 max-w-md font-sans text-base text-[var(--ag-gold-soft)] sm:text-lg">
              Experience Luxury & Comfort
            </p>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/80 md:text-base">
              Hotel stays, banquet celebrations, and IRAA Dine — near Benz Circle,
              Eluru Road. Call{" "}
              <a
                href={`tel:${phone}`}
                className="font-medium text-white underline decoration-[var(--ag-gold)] underline-offset-4"
              >
                {phone}
              </a>
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/book"
                className="inline-flex h-11 items-center justify-center bg-[var(--ag-gold)] px-6 text-sm font-semibold tracking-wide text-[var(--ag-red-deep)] transition hover:bg-[var(--ag-gold-soft)]"
              >
                Book Your Stay
              </Link>
              <Link
                href="/banquet"
                className="inline-flex h-11 items-center justify-center border border-white/70 bg-transparent px-6 text-sm font-semibold tracking-wide text-white transition hover:border-[var(--ag-gold)] hover:text-[var(--ag-gold-soft)]"
              >
                Plan an Event
              </Link>
            </div>
          </div>

          <Link
            href="/food"
            className="animate-drift-delay flex shrink-0 flex-col items-center gap-2 text-center"
            aria-label={`${brand} — open dining menu`}
          >
            <Image
              src={logo}
              alt=""
              width={72}
              height={72}
              className="h-14 w-14 drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)] md:h-[4.5rem] md:w-[4.5rem]"
              unoptimized
              priority
            />
            <span>
              <span className="block font-display text-lg tracking-[0.16em] text-white md:text-xl">
                IRAA
              </span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--ag-gold)]">
                Dine
              </span>
            </span>
          </Link>
        </div>

        <div className="animate-drift mt-10 flex flex-wrap items-end justify-between gap-4 border-t border-white/20 pt-5 text-xs uppercase tracking-[0.18em] text-white/70 md:mt-0">
          <p>Rooms · Banquet · Party Hall · IRAA Dine</p>
          <Link href="/gallery" className="text-[var(--ag-gold-soft)] hover:text-white">
            View gallery →
          </Link>
        </div>
      </div>
    </section>
  );
}
