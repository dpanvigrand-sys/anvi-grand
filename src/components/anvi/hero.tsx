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
    <section className="relative min-h-[72svh] overflow-hidden md:min-h-[82svh]">
      <div
        className="absolute inset-0 bg-cover bg-[center_28%]"
        style={{ backgroundImage: `url(${src})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(90,0,0,0.58)_0%,rgba(26,18,16,0.28)_50%,rgba(0,0,0,0.2)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#8b0000_0%,#d4af37_50%,#8b0000_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />

      {/* Left — Welcome */}
      <div className="absolute left-3 top-5 z-20 max-w-[min(58%,22rem)] text-left sm:left-5 sm:max-w-md md:left-8 md:top-7 md:max-w-xl">
        <h1
          className="font-sans text-3xl leading-tight tracking-normal text-white sm:text-4xl md:text-5xl"
          style={{
            fontWeight: 400,
            fontFamily:
              "var(--font-outfit), ui-sans-serif, system-ui, sans-serif",
            textShadow: "0 2px 16px rgba(0,0,0,0.55)",
          }}
        >
          <span className="block" style={{ fontSize: "75%", fontWeight: 400 }}>
            Welcome to
          </span>
          <span className="block" style={{ fontWeight: 400 }}>
            Anvi Grand
          </span>
        </h1>
        <p
          className="mt-2 text-base text-[var(--ag-gold)] sm:text-lg md:text-xl"
          style={{
            fontWeight: 400,
            fontFamily:
              "var(--font-outfit), ui-sans-serif, system-ui, sans-serif",
            textShadow: "0 1px 10px rgba(0,0,0,0.45)",
          }}
        >
          Experience Luxury & Comfort
        </p>
        <p
          className="mt-3 max-w-md text-sm text-white/85 md:text-base"
          style={{ fontWeight: 400 }}
        >
          Near Benz Circle, Eluru Road, Vijayawada · Call{" "}
          <a
            href={`tel:${phone}`}
            className="text-white underline decoration-[var(--ag-gold)] underline-offset-4"
            style={{ fontWeight: 400 }}
          >
            {phone}
          </a>
        </p>
      </div>

      {/* Right top — opposite Welcome: IRAA logo + IRAA Dine */}
      <Link
        href="/food"
        className="absolute right-3 top-5 z-20 flex max-w-[42%] flex-col items-end gap-1.5 text-right sm:right-5 md:right-8 md:top-7"
        aria-label={`${brand} — open dining menu`}
      >
        <span className="flex items-center gap-2 rounded-sm bg-[rgba(90,0,0,0.72)] px-2.5 py-2 ring-1 ring-[var(--ag-gold)]/65 backdrop-blur-sm sm:gap-3 sm:px-3 sm:py-2.5">
          <Image
            src={logo}
            alt=""
            width={56}
            height={56}
            className="h-11 w-11 shrink-0 drop-shadow md:h-14 md:w-14"
            unoptimized
            priority
          />
          <span className="pr-0.5 text-left">
            <span
              className="block font-display text-lg leading-none tracking-[0.12em] text-white sm:text-xl md:text-2xl"
              style={{ textShadow: "0 1px 10px rgba(0,0,0,0.45)" }}
            >
              IRAA
            </span>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--ag-gold)] sm:text-xs">
              Dine
            </span>
          </span>
        </span>
      </Link>
    </section>
  );
}
