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
          
          <div className="mt-8 p-5 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
            <p className="text-xs font-black text-white mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-lime" /> {env.demoMode ? 'demo credentials' : 'pilot launch'}
            </p>
            {env.demoMode ? (
              <ul className="text-xs text-slate-300 space-y-2 font-mono">
                <li className="flex justify-between border-b border-white/5 pb-1">
                  <span>Player:</span>
                  <span className="font-bold text-brand-lime">9876543210</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-1">
                  <span>Owner:</span>
                  <span className="font-bold text-brand-lime">1111111111</span>
                </li>
                <li className="flex justify-between pb-1">
                  <span>Super Admin:</span>
                  <span className="font-bold text-brand-lime">9999999999</span>
                </li>
              </ul>
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed">
                Enter your real mobile number. We&apos;ll send a one-time code via SMS — no demo shortcuts in pilot mode.
              </p>
            )}
          </div>
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
              <label className="tm-label text-[10px] sm:text-xs">mobile</label>
              <div className="flex gap-2 sm:gap-3">
                <div className="shrink-0 flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2.5 sm:py-3.5 rounded-2xl sm:rounded-[20px] bg-slate-100 border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 shadow-sm">
                  🇮🇳 +91
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={app.phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    app.setPhoneNumber(val);
                    app.updateOnboardingData({ phoneNumber: val });
                  }}
                  placeholder="10 digits"
                  className="tm-input flex-1 py-2.5 sm:py-3.5 text-base sm:text-sm min-w-0"
                />
              </div>
            </div>

            <Button
              size="md"
              variant="grass"
              className="w-full sm:!px-8 sm:!py-4 sm:!text-base flex items-center justify-center gap-2"
              disabled={app.phoneNumber.length !== 10}
              onClick={() => app.handleSendOTP(false)}
            >
              send code <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>

            {env.demoMode && (
              <>
                <div className="relative flex items-center gap-3 py-0.5">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">or login with</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      app.updateOnboardingData({ name: 'Google User', phoneNumber: '9876543210' });
                      app.setPhoneNumber('9876543210');
                      app.handleSendOTP(false);
                    }}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl px-3 py-3 text-xs sm:text-sm font-black text-slate-700 flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-sm hover:bg-slate-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      app.updateOnboardingData({ name: 'Apple User', phoneNumber: '9876543210' });
                      app.setPhoneNumber('9876543210');
                      app.handleSendOTP(false);
                    }}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl px-3 py-3 text-xs sm:text-sm font-black text-slate-700 flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-sm hover:bg-slate-50"
                  >
                    <svg className="w-4 h-4 fill-current text-slate-800" viewBox="0 0 24 24">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C4.18 16.57 3.38 10.9 6.84 7.63c1.55-1.47 3.26-1.42 4.26-.9 1.18.6 1.94.57 3.12 0 1.5-.74 3.04-.6 4.14.47-3.2 3.73-2.4 9.5 1.05 10.97-1.05 2.22-2.3 2.16-2.36 2.11zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.26 2.5-2.12 4.54-3.74 4.25z" />
                    </svg>
                    Apple
                  </button>
                </div>

                <details className="lg:hidden rounded-[20px] border border-slate-200/80 bg-slate-50 overflow-hidden shadow-sm">
                  <summary className="px-4 py-3 text-xs font-black text-brand-forest cursor-pointer select-none flex justify-between items-center">
                    <span>🚀 quick login credentials</span>
                  </summary>
                  <ul className="px-4 pb-4 text-xs text-slate-600 space-y-2 font-mono border-t border-slate-100 pt-3">
                    <li className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span>Player:</span>
                      <span className="font-bold text-brand-grassDeep">9876543210</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span>Owner:</span>
                      <span className="font-bold text-brand-grassDeep">1111111111</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Super Admin:</span>
                      <span className="font-bold text-brand-grassDeep">9999999999</span>
                    </li>
                  </ul>
                </details>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
