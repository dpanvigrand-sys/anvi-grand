import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import { isUploadSrc } from "@/lib/media-place";
import type { Room } from "@/lib/types";

export function RoomTeaser({ room }: { room: Room }) {
  return (
    <Link href={`/rooms/${room.id}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={room.image}
          alt={room.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-105"
          unoptimized={isUploadSrc(room.image)}
        />
      </div>
      <div className="mt-4">
        <h3 className="font-display text-2xl text-[var(--ag-chocolate)]">{room.name}</h3>
        <p className="mt-1 text-sm text-[var(--ag-muted)]">{room.tagline}</p>
        <p className="mt-2 text-sm font-medium text-[var(--ag-red)]">
          From {formatINR(room.pricePerNight)} / night
        </p>
      </div>
    </Link>
  );
}
