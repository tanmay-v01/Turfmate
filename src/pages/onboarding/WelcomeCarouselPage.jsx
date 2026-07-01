import { ChevronRight, Sparkles, Shield, Zap, Users, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import TurfMateLogo from '../../components/ui/TurfMateLogo';
import GrassBackground from '../../components/ui/GrassBackground';
import LiveTicker from '../../components/ui/LiveTicker';

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&q=80&w=1400',
    tag: 'discover',
    title: 'turfs near you, fr',
    description: 'scroll premium pitches, grab open slots, lock in before someone else does.',
  },
  {
    image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&q=80&w=1400',
    tag: 'split pay',
    title: 'no more chasing ₹',
    description: 'pay your share, drop open spots, let the squad settle the rest. easy.',
  },
  {
    image: 'https://images.unsplash.com/photo-1574629810360-7efbc195a835?auto=format&fit=crop&q=80&w=1400',
    tag: 'squad up',
    title: 'find players in 10km',
    description: 'match by sport + skill. build your local dream team without the group chat chaos.',
  },
];

const FEATURES = [
  { icon: Zap, text: 'instant slot booking', sub: 'in under 10s', color: 'text-amber-400 bg-amber-400/10' },
  { icon: Users, text: 'split pay with squad', sub: 'zero chasing ₹', color: 'text-lime-400 bg-lime-400/10' },
  { icon: Shield, text: 'verified turf partners', sub: '100% safe checkout', color: 'text-sky-400 bg-sky-400/10' },
  { icon: Star, text: '4.8★ avg rating', sub: 'trusted by 4k+ players', color: 'text-rose-400 bg-rose-400/10' },
];

const TICKER = ['2.4k players in Virar', '180+ turfs listed', 'split games every hour', 'zero chase for ₹'];

export default function WelcomeCarouselPage() {
  const app = useApp();
  const slide = SLIDES[app.carouselIndex];

  return (
    <div className="tm-auth-split relative overflow-hidden bg-[#090D19]">
      <GrassBackground />

      {/* LEFT COLUMN: IMMERSIVE VISUAL PANEL */}
      <div className="relative min-h-[42vh] lg:min-h-screen overflow-hidden">
        <img key={slide.image} src={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover animate-scale-in" />
        
        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 lg:bg-gradient-to-r lg:from-black/60 lg:via-black/35 lg:to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-between p-6 lg:p-12 z-10">
          <div className="flex items-center gap-3 animate-pop">
            <div className="p-1.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
              <TurfMateLogo size="sm" />
            </div>
            <span className="font-display font-extrabold text-white text-lg tracking-tight lowercase">turfmate</span>
          </div>

          <div className="max-w-lg animate-fade-up">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/20 border border-lime-400/30 text-lime-300 text-[10px] font-black uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-lime-300" /> {slide.tag}
            </span>
            <h2 className="text-3xl lg:text-5xl font-display font-black text-white leading-[1.08] lowercase drop-shadow-md">
              {slide.title}
            </h2>
            <p className="mt-4 text-slate-200 text-sm lg:text-base font-semibold leading-relaxed drop-shadow-sm">{slide.description}</p>
            
            <div className="hidden lg:flex flex-wrap gap-2 mt-6">
              {['⚽ football', '🏏 cricket', '🏸 badminton', '🏀 ballers'].map((t) => (
                <span key={t} className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/95 text-[11px] font-black tracking-wide backdrop-blur-md">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: ACTION PANEL */}
      <div className="tm-auth-form relative">
        <div className="w-full max-w-md mx-auto flex flex-col justify-center gap-8 py-6">
          <LiveTicker items={TICKER} />

          {/* Slide copy for mobile */}
          <div className="lg:hidden animate-fade-up bg-white/5 border border-white/10 p-5 rounded-[24px] backdrop-blur-sm">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-lime-400/15 text-[9px] font-black text-lime-400 uppercase tracking-wide mb-2.5">
              {slide.tag}
            </span>
            <h2 className="text-2xl font-display font-extrabold text-white lowercase leading-tight">{slide.title}</h2>
            <p className="mt-2 text-slate-500 text-xs font-semibold leading-relaxed">{slide.description}</p>
          </div>

          {/* Page Indicators */}
          <div className="flex justify-center gap-1.5">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => app.setCarouselIndex(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  app.carouselIndex === idx ? 'w-8 bg-lime-400' : 'w-2 bg-white/15 hover:bg-white/25'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              className="w-full py-4 px-8 text-base font-display font-bold rounded-2xl transition-all duration-300 active:scale-[0.97] bg-lime-400 text-slate-900 shadow-lg shadow-lime-400/25 hover:bg-lime-300 flex items-center justify-center gap-2"
              onClick={() => app.navigateTo('login')}
            >
              let&apos;s go <ChevronRight className="w-5 h-5" />
            </button>
            
            <p className="text-center text-xs text-slate-500">
              already in?{' '}
              <button onClick={() => app.navigateTo('login')} className="font-black text-lime-400 hover:text-lime-300 transition-colors border-b border-lime-400/30 hover:border-lime-300 pb-0.5">
                sign in →
              </button>
            </p>
          </div>

          {/* Interactive Feature Cards */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <div key={f.text} className="bg-white/[0.03] border border-white/[0.08] hover:border-lime-400/30 p-4 rounded-3xl flex items-center gap-3 hover:-translate-y-0.5 transition-all duration-300 group">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${f.color}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-slate-200 leading-tight">{f.text}</p>
                  <p className="text-[9px] text-slate-500 font-bold mt-0.5">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
