import { ArrowLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import TurfMateLogo from '../../components/ui/TurfMateLogo';
import GrassBackground from '../../components/ui/GrassBackground';
import StepProgress from '../../components/onboarding/StepProgress';
import env from '../../config/env';
import { openSupportWhatsApp } from '../../utils/support';

export default function OtpVerifyPage() {
  const app = useApp();

  return (
    <div className="tm-auth-split relative min-h-[100dvh] bg-[#090D19]">
      <GrassBackground />

      {/* LEFT COLUMN: IMMERSIVE VISUAL PANEL */}
      <div className="tm-auth-visual bg-slate-950 text-white hidden lg:flex">
        <img
          src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        <div className="relative z-10 p-12 max-w-lg animate-fade-up-slow">
          <TurfMateLogo size="md" className="mb-8 animate-float" />
          <h2 className="text-4xl font-display font-black text-white leading-tight lowercase">
            almost<br /><span className="text-lime-400">in the game</span>
          </h2>
          <p className="mt-4 text-slate-300 font-semibold leading-relaxed text-sm">
            4 digits stand between you and your next kickoff.
          </p>
        </div>
      </div>

      {/* Form — compact on mobile */}
      <div className="tm-auth-form">
        <div className="w-full max-w-md mx-auto animate-pop flex flex-col min-h-0 lg:justify-center">
          <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4 lg:hidden">
            <button
              onClick={() => app.navigateTo('login')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-lime-400 shrink-0 transition"
            >
              <ArrowLeft className="w-4 h-4" /> back
            </button>
            <TurfMateLogo size="sm" />
            <div className="w-12" aria-hidden />
          </div>

          <button
            onClick={() => app.navigateTo('login')}
            className="hidden lg:flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-lime-400 mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" /> back
          </button>

          <StepProgress step={2} totalSteps={3} flow="player" className="mb-4 lg:hidden" />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase bg-lime-400/10 text-lime-400 border border-lime-400/20 w-fit mb-2">verify</span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white lowercase leading-tight">
            enter the code
          </h1>
          <p className="mt-1 sm:mt-2 text-slate-500 text-xs sm:text-sm">sent to {app.phoneNumber.includes('@') ? '' : '+91 '}{app.phoneNumber}</p>

          <div className="mt-6 sm:mt-8 flex justify-center gap-2 sm:gap-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <input
                key={idx}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={app.otpCode[idx] || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (!val) return;
                  const newOtp = app.otpCode.split('');
                  newOtp[idx] = val;
                  app.setOtpCode(newOtp.join(''));
                  if (idx < 3) e.target.nextSibling?.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace') {
                    const newOtp = app.otpCode.split('');
                    if (!newOtp[idx] && idx > 0) {
                      newOtp[idx - 1] = '';
                      app.setOtpCode(newOtp.join(''));
                      e.target.previousSibling?.focus();
                    } else {
                      newOtp[idx] = '';
                      app.setOtpCode(newOtp.join(''));
                    }
                  }
                }}
                className="w-12 h-14 sm:w-14 sm:h-16 bg-white/5 border border-white/10 rounded-2xl text-center text-xl sm:text-2xl font-display font-extrabold text-lime-400 focus:outline-none focus:border-lime-400/50 focus:ring-2 focus:ring-lime-400/15 transition-all"
              />
            ))}
          </div>

          <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <span className="text-slate-500 font-medium">didn&apos;t get it?</span>
            {app.loginTimer > 0 ? (
              <span className="font-bold text-slate-400">resend in {app.loginTimer}s</span>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => app.handleSendOTP(false)} className="font-bold text-lime-400 hover:underline pb-0.5 border-b border-dashed border-lime-400/30">
                  resend SMS
                </button>
                <button onClick={() => app.handleSendOTP(true)} className="px-3 py-1 rounded-full bg-[#25D366] text-white text-[10px] sm:text-xs font-black shadow-sm hover:scale-102 active:scale-98 transition">
                  whatsapp
                </button>
              </div>
            )}
          </div>

          {!env.demoMode && env.supportWhatsApp && (
            <p className="mt-3 text-xs text-slate-500">
              Still stuck?{' '}
              <button
                type="button"
                onClick={() => openSupportWhatsApp('Hi, I am not receiving my TurfMate OTP.')}
                className="font-bold text-[#25D366] hover:underline"
              >
                message support on WhatsApp
              </button>
            </p>
          )}

          <button
            className="w-full mt-6 sm:mt-8 sm:px-8 sm:py-4 py-3.5 px-6 text-sm sm:text-base font-display font-bold rounded-2xl transition-all duration-300 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none bg-lime-400 text-slate-900 shadow-lg shadow-lime-400/25 hover:bg-lime-300 flex items-center justify-center gap-2"
            disabled={app.otpCode.length !== 4}
            onClick={app.handleVerifyOTP}
          >
            Verify & Go <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
