export function MapEmbed({ className = "" }: { className?: string }) {
  return (
    <iframe
      title="ANVI GRAND near Benz Circle, Vijayawada"
      src="https://www.google.com/maps?q=16.506605130133785,80.66238515786827&z=17&output=embed"
      className={`h-full w-full border-0 ${className}`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}
