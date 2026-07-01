export default function GrassBackground({ className = '' }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden>
      <div className="absolute w-72 h-72 -top-20 -right-20 rounded-full bg-lime-400/8 blur-[80px]" />
      <div className="absolute w-96 h-96 bottom-0 -left-32 rounded-full bg-indigo-500/6 blur-[100px]" />
      <div className="absolute w-48 h-48 top-1/3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-400/5 blur-[60px]" />
    </div>
  );
}
