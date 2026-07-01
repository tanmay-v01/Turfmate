import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import TurfMateLogo from '../../components/ui/TurfMateLogo';
import GrassBackground from '../../components/ui/GrassBackground';
import env from '../../config/env';

export default function LoginPage() {
  const app = useApp();

  return (
    <div className="tm-auth-split relative min-h-[100dvh] bg-[#FAFBFC]">
      <GrassBackground />

      {/* LEFT COLUMN */}
      <div className="tm-auth-visual bg-slate-950 text-white">
        <img
          src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        <div className="relative z-10 p-12 max-w-lg animate-fade-up-slow">
          <TurfMateLogo size="md" className="mb-8 animate-float" />
          <h2 className="text-4xl font-display font-black text-white leading-tight lowercase">
            your turf.<br />
            <span className="text-emerald-400">your squad.</span>
          </h2>
          <p className="mt-4 text-slate-300 font-semibold leading-relaxed text-sm">
            one tap verify → book slots, split costs, join lobbies. that&apos;s it.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="tm-auth-form bg-white/50 backdrop-blur-sm">
        <div className="w-full max-w-md mx-auto animate-pop flex flex-col min-h-0 lg:justify-center">
          {/* Mobile header */}
          <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6 lg:hidden">
            <button
              onClick={() => app.navigateTo('welcome_carousel')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 shrink-0 transition"
            >
              <ArrowLeft className="w-4 h-4" /> back
            </button>
            <TurfMateLogo size="sm" />
            <div className="w-12" aria-hidden />
          </div>

          <button
            onClick={() => app.navigateTo('welcome_carousel')}
            className="hidden lg:flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" /> back
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-200 w-fit mb-2 sm:mb-3">sign in</span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800 lowercase leading-tight">
            drop your number
          </h1>
          <p className="mt-1 sm:mt-2 text-slate-500 text-xs sm:text-sm">we&apos;ll ping you a code. no spam.</p>

          <div className="mt-5 sm:mt-8 space-y-4 sm:space-y-6">
            <div>
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">mobile or email</label>
              <div className="flex gap-2 sm:gap-3 mt-1.5">
                {!app.phoneNumber.includes('@') && !/[a-zA-Z]/.test(app.phoneNumber) && (
                  <div className="shrink-0 flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 shadow-sm transition">
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
                  className="flex-1 py-2.5 sm:py-3.5 px-4 text-base sm:text-sm min-w-0 bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-2xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            <button
              className="w-full sm:px-8 sm:py-4 py-3.5 px-6 text-sm sm:text-base font-display font-bold rounded-2xl transition-all duration-300 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 flex items-center justify-center gap-2"
              disabled={!app.phoneNumber || (app.phoneNumber.length < 10 && !app.phoneNumber.includes('@'))}
              onClick={() => app.handleSendOTP(false)}
            >
              Send OTP Code <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
