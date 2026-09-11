export function Hero() {
  return (
    <section className="relative min-h-[68svh] overflow-hidden md:min-h-[78svh]">
      <div
        className="animate-ken-burns absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80)",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(80,0,0,0.45)_0%,transparent_55%)]" />

      <div className="relative mx-auto flex min-h-[68svh] w-full max-w-6xl flex-col justify-center px-5 py-20 md:min-h-[78svh] md:px-8 md:py-28">
        <div className="max-w-xl">
          <h1 className="animate-drift font-sans text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-sm sm:text-5xl md:text-6xl">
            Welcome to Anvi Grand
          </h1>
          <p className="animate-drift-delay mt-3 text-lg font-medium text-white/95 sm:text-xl md:text-2xl">
            Experience Luxury & Comfort
          </p>
          <p className="mt-4 max-w-md text-sm text-white/80 md:text-base">
            Near Benz Circle, Eluru Road, Vijayawada · Call{" "}
            <a
              href="tel:7569494949"
              className="font-semibold text-white underline underline-offset-4"
            >
              7569494949
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
