import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { SiteFooter } from "@/components/anvi/site-footer";
import { SiteHeader } from "@/components/anvi/site-header";
import { StickyLocationMark } from "@/components/anvi/sticky-location-mark";
import { LiveDataRefresh } from "@/components/live-data-refresh";
import { getHotel, resolveHotelPhones } from "@/lib/store";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ANVI GRAND — Hotel & CHIGURU, Vijayawada",
    template: "%s · ANVI GRAND",
  },
  description:
    "ANVI GRAND near Benz Circle, Eluru Road, Vijayawada. Rooms, banquet, party hall, and CHIGURU dining. Call 7569494949.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hotel = await getHotel();
  const phones = resolveHotelPhones(hotel);

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <LiveDataRefresh />
        <SiteHeader receptionPhone={phones.reception} />
        <main className="flex-1">{children}</main>
        <SiteFooter
          receptionPhone={phones.reception}
          roomsPhone={phones.rooms}
          foodPhone={phones.food}
          email={hotel.email}
          address={hotel.address}
        />
        <StickyLocationMark address={hotel.address} />
      </body>
    </html>
  );
}
