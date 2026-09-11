export function MapEmbed({ className = "" }: { className?: string }) {
  return (
    <iframe
      title="ANVI GRAND near Benz Circle, Vijayawada"
      src="https://www.google.com/maps?q=Benz+Circle,+Eluru+Road,+Vijayawada&output=embed"
      className={`h-full w-full border-0 ${className}`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}
