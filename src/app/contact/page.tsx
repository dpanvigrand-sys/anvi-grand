import type { Metadata } from "next";
import { ContactForm } from "@/components/hotel/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach Havenmere concierge for dining, spa, and stay questions.",
};

export default function ContactPage() {
  return (
    <div className="pt-24">
      <section className="mx-auto grid w-full max-w-6xl gap-12 px-5 pb-24 pt-8 md:grid-cols-[0.9fr_1.1fr] md:px-8 md:pt-12">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--hm-sea)]">
            Concierge
          </p>
          <h1 className="mt-3 font-display text-5xl text-[var(--hm-ink)] md:text-6xl">
            Contact
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--hm-muted)]">
            Questions about arrival times, dining, or accessibility—send a note
            and we’ll reply from the front desk.
          </p>
          <div className="mt-8 space-y-4 text-sm text-[var(--hm-ink)]">
            <p>
              <span className="block text-xs uppercase tracking-[0.16em] text-[var(--hm-muted)]">
                Front desk
              </span>
              +1 (207) 555-0148
              <br />
              stay@havenmere.example
            </p>
            <p>
              <span className="block text-xs uppercase tracking-[0.16em] text-[var(--hm-muted)]">
                Address
              </span>
              48 Shoreline Road
              <br />
              North Haven, ME 04853
            </p>
          </div>
        </div>

        <div className="border border-[var(--hm-line)] bg-white/75 p-5 md:p-8">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
