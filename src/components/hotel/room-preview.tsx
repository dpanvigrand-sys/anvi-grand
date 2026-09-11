import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { Room } from "@/lib/types";

export function RoomPreview({ room }: { room: Room }) {
  return (
    <article className="group grid gap-4 md:gap-5">
      <Link href={`/rooms/${room.id}`} className="relative block overflow-hidden">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={room.image}
            alt={room.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
          />
        </div>
      </Link>
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-2xl text-[var(--hm-ink)] md:text-3xl">
            <Link href={`/rooms/${room.id}`}>{room.name}</Link>
          </h3>
          <p className="shrink-0 text-sm text-[var(--hm-muted)]">
            {formatCurrency(room.pricePerNight)}
            <span className="text-[var(--hm-muted)]"> / night</span>
          </p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[var(--hm-muted)]">
          {room.tagline}
        </p>
      </div>
    </article>
  );
}
