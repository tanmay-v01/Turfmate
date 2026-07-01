import { ArrowLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import TurfMateLogo from '../../components/ui/TurfMateLogo';
import Button from '../../components/ui/Button';
import GrassBackground from '../../components/ui/GrassBackground';
import env from '../../config/env';

export default function LoginPage() {
  const app = useApp();

  return (
    <div className="tm-auth-split relative min-h-[100dvh]">
      <GrassBackground />

      {/* LEFT COLUMN: IMMERSIVE VISUAL PANEL */}
      <div className="tm-auth-visual bg-slate-950 text-white">
        <img
          src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        <div className="relative z-10 p-12 max-w-lg animate-fade-up-slow">
          <TurfMateLogo size="md" className="mb-8 animate-float" />
          <h2 className="text-4xl font-display font-black text-white leading-tight lowercase">
            your turf.<br />
            <span className="text-brand-lime">your squad.</span>
          </h2>
          <p className="mt-4 text-slate-200 font-semibold leading-relaxed text-sm">
            one tap verify → book slots, split costs, join lobbies. that&apos;s it.
          </p>
        </div>
      </div>

      {/* Form — compact on mobile */}
      <div className="tm-auth-form bg-slate-50/50 backdrop-blur-sm">
        <div className="w-full max-w-md mx-auto animate-pop flex flex-col min-h-0 lg:justify-center">
          {/* Mobile header strip */}
          <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6 lg:hidden">
            <button
              onClick={() => app.navigateTo('welcome_carousel')}
              className="flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-forest shrink-0"
            >
              <ArrowLeft className="w-4 h-4" /> back
            </button>
            <TurfMateLogo size="sm" />
            <div className="w-12" aria-hidden />
          </div>

          <button
            onClick={() => app.navigateTo('welcome_carousel')}
            className="hidden lg:flex items-center gap-2 text-sm font-bold text-brand-muted hover:text-brand-forest mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" /> back
          </button>

          <p className="tm-pill w-fit mb-2 sm:mb-3 text-[10px] sm:text-xs">sign in</p>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-brand-forest lowercase leading-tight">
            drop your number
          </h1>
          <p className="mt-1 sm:mt-2 text-brand-muted text-xs sm:text-sm">we&apos;ll ping you a code. no spam.</p>

          <div className="mt-5 sm:mt-8 space-y-4 sm:space-y-6">
            <div>
              <label className="tm-label text-[10px] sm:text-xs tracking-wider uppercase opacity-80">mobile or email</label>
              <div className="flex gap-2 sm:gap-3 mt-1.5">
                {!app.phoneNumber.includes('@') && !/[a-zA-Z]/.test(app.phoneNumber) && (
                  <div className="shrink-0 flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-2xl bg-white border border-slate-100 text-xs sm:text-sm font-bold text-slate-800 shadow-sm transition">
                    🇮🇳 +91
                  </div>
                )}
                <input
                  type="text"
                  autoComplete="username"
                  value={app.phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    app.setPhoneNumber(val);
                    app.updateOnboardingData({ phoneNumber: val });
                  }}
                  placeholder="Enter 10 digits or email"
                  className="tm-input flex-1 py-2.5 sm:py-3.5 px-4 text-base sm:text-sm min-w-0 bg-white border border-slate-100 focus:border-brand-primary rounded-2xl shadow-sm focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300"
                />
              </div>
            </div>

            <Button
              size="md"
              variant="grass"
              className="w-full sm:!px-8 sm:!py-4 sm:!text-base flex items-center justify-center gap-2 rounded-2xl shadow-premium hover:shadow-premium-hover transition-all duration-300 transform active:scale-98"
              disabled={!app.phoneNumber || (app.phoneNumber.length < 10 && !app.phoneNumber.includes('@'))}
              onClick={() => app.handleSendOTP(false)}
            >
              Send OTP Code <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
