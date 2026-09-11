export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-5 pt-24">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-[var(--hm-sea)]/25" />
        <p className="mt-4 font-display text-2xl text-[var(--hm-ink)]">
          Loading…
        </p>
        <p className="mt-1 text-sm text-[var(--hm-muted)]">
          Fetching rooms and stay details.
        </p>
      </div>
    </div>
  );
}
