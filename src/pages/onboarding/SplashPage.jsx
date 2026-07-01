import TurfMateLogo from '../../components/ui/TurfMateLogo';
import GrassBackground from '../../components/ui/GrassBackground';

const FLOATERS = ['⚽', '🏏', '🏸', '💸', '🏃', '🏟️'];

export default function SplashPage() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#FAFBFC]">
      <GrassBackground />
      <img
        src="https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&q=80&w=1920"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-10"
      />

      {FLOATERS.map((emoji, i) => (
        <span
          key={emoji}
          className="absolute text-2xl sm:text-3xl opacity-30 animate-float pointer-events-none select-none"
          style={{
            top: `${15 + (i * 13) % 70}%`,
            left: `${8 + (i * 17) % 84}%`,
            animationDelay: `${i * 0.5}s`,
          }}
        >
          {emoji}
        </span>
      ))}

      <div className="relative z-10 flex flex-col items-center text-center px-6 animate-pop">
        <TurfMateLogo size="xl" className="animate-float mb-8" />
        <h1 className="text-5xl sm:text-6xl font-display font-extrabold text-slate-800">
          Turf<span className="text-emerald-500">Mate</span>
        </h1>
        <p className="mt-4 text-slate-500 font-medium">book · split · vibe · repeat</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-xs">
          {['virar', 'mumbai', 'squad up'].map((t) => (
            <span key={t} className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">#{t}</span>
          ))}
        </div>
        <div className="mt-10 flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse-soft"
              style={{ animationDelay: `${i * 0.25}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
