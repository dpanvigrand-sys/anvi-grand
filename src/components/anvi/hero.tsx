export function Hero({
  imageSrc,
  receptionPhone = "7569494949",
}: {
  imageSrc?: string;
  receptionPhone?: string;
}) {
  const src = imageSrc?.trim() || "/images/anvi-entrance.jpg";
  const phone = receptionPhone.trim() || "7569494949";

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

      <div
        className="absolute z-20 max-w-[min(100%,28rem)] px-1 text-left sm:max-w-xl"
        style={{ top: 20, left: 12, right: 12, fontWeight: 400 }}
      >
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

      <a
        href="https://maps.app.goo.gl/F5K19Sff5QfKbEZs5"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute z-20 max-w-[16rem] rounded-md border border-[var(--ag-gold)]/70 bg-[rgba(90,0,0,0.82)] px-3 py-2.5 text-left shadow-lg backdrop-blur-sm transition hover:border-[var(--ag-gold)] hover:bg-[rgba(90,0,0,0.92)] md:max-w-xs"
        style={{ bottom: 16, right: 16, fontWeight: 400 }}
        aria-label="Open ANVI GRAND location on Google Maps"
      >
        <span
          className="block text-[10px] uppercase tracking-[0.16em] text-[var(--ag-gold)]"
          style={{ fontWeight: 400 }}
        >
          Location
        </span>
        <span
          className="mt-1 block text-sm text-white"
          style={{ fontWeight: 400 }}
        >
          Near Benz Circle, Eluru Road, Vijayawada
        </span>
        <span
          className="mt-1 block text-xs text-[var(--ag-gold)] underline underline-offset-2"
          style={{ fontWeight: 400 }}
        >
          Open in Google Maps
        </span>
      </a>
    </section>
  );
}
