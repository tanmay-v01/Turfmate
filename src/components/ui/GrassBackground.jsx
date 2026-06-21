export default function GrassBackground({ className = '' }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden>
      <div className="tm-blob tm-blob-grass w-72 h-72 -top-20 -right-20" />
      <div className="tm-blob tm-blob-lime w-96 h-96 bottom-0 -left-32" />
      <div className="tm-blob tm-blob-mint w-48 h-48 top-1/3 left-1/2 -translate-x-1/2" />
    </div>
  );
}
