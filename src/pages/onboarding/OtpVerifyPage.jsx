import { ArrowLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import TurfMateLogo from '../../components/ui/TurfMateLogo';
import Button from '../../components/ui/Button';
import GrassBackground from '../../components/ui/GrassBackground';
import StepProgress from '../../components/onboarding/StepProgress';
import env from '../../config/env';
import { openSupportWhatsApp } from '../../utils/support';

export default function OtpVerifyPage() {
  const app = useApp();

  return (
    <div className="tm-auth-split relative min-h-[100dvh]">
      <GrassBackground />

      {/* LEFT COLUMN: IMMERSIVE VISUAL PANEL */}
      <div className="tm-auth-visual bg-slate-950 text-white hidden lg:flex">
        <img
          src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        <div className="relative z-10 p-12 max-w-lg animate-fade-up-slow">
          <TurfMateLogo size="md" className="mb-8 animate-float" />
          <h2 className="text-4xl font-display font-black text-white leading-tight lowercase">
            almost<br /><span className="text-brand-lime">in the game</span>
          </h2>
          <p className="mt-4 text-slate-200 font-semibold leading-relaxed text-sm">
            4 digits stand between you and your next kickoff.
          </p>
          
          {env.demoMode && (
            <div className="mt-8 p-5 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
              <p className="text-xs font-black text-white mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-lime" /> demo credentials
              </p>
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
            </div>
          )}
        </div>
      </div>

      {/* Form — compact on mobile */}
      <div className="tm-auth-form bg-slate-50/50 backdrop-blur-sm">
        <div className="w-full max-w-md mx-auto animate-pop flex flex-col min-h-0 lg:justify-center">
          <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4 lg:hidden">
            <button
              onClick={() => app.navigateTo('login')}
              className="flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-forest shrink-0"
            >
              <ArrowLeft className="w-4 h-4" /> back
            </button>
            <TurfMateLogo size="sm" />
            <div className="w-12" aria-hidden />
          </div>

          <button
            onClick={() => app.navigateTo('login')}
            className="hidden lg:flex items-center gap-2 text-sm font-bold text-brand-muted hover:text-brand-forest mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" /> back
          </button>

          <StepProgress step={2} totalSteps={3} flow="player" className="mb-4 lg:hidden" />
          <span className="tm-pill w-fit mb-2 text-[10px] sm:text-xs">verify</span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-brand-forest lowercase leading-tight">
            enter the code
          </h1>
          <p className="mt-1 sm:mt-2 text-brand-muted text-xs sm:text-sm">sent to {app.phoneNumber.includes('@') ? '' : '+91 '}{app.phoneNumber}</p>

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
                className="w-12 h-14 sm:w-14 sm:h-16 bg-white border-2 border-brand-border rounded-2xl sm:rounded-[22px] text-center text-xl sm:text-2xl font-display font-extrabold text-brand-forest focus:outline-none focus:border-brand-grassFresh focus:ring-2 focus:ring-brand-grassFresh/20 transition-all"
              />
            ))}
          </div>

          {env.demoMode && (
            <details className="mt-4 sm:mt-6 rounded-[20px] border border-slate-200/80 bg-slate-50 overflow-hidden shadow-sm lg:hidden">
              <summary className="px-4 py-3 text-xs font-black text-brand-forest cursor-pointer select-none flex justify-between items-center">
                <span>🚀 quick credentials (OTP: 1234)</span>
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
          )}

          {env.demoMode && (
            <div className="hidden lg:block mt-6 p-5 rounded-[24px] bg-brand-grassPale/50 border border-brand-border/60 text-xs text-brand-grassInk shadow-sm leading-relaxed">
              <strong>demo instructions:</strong> type <strong>1234</strong> to verify and login instantly.
            </div>
          )}

          <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <span className="text-brand-muted font-medium">didn&apos;t get it?</span>
            {app.loginTimer > 0 ? (
              <span className="font-bold text-brand-grassInk">resend in {app.loginTimer}s</span>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => app.handleSendOTP(false)} className="font-bold text-brand-grassDeep hover:underline pb-0.5 border-b border-dashed border-brand-grassDeep">
                  resend sms
                </button>
                <button onClick={() => app.handleSendOTP(true)} className="px-3 py-1 rounded-full bg-[#25D366] text-white text-[10px] sm:text-xs font-black shadow-sm hover:scale-102 active:scale-98 transition">
                  whatsapp
                </button>
              </div>
            )}
          </div>

          {!env.demoMode && env.supportWhatsApp && (
            <p className="mt-3 text-xs text-brand-muted">
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

          <Button
            size="md"
            variant="grass"
            className="w-full mt-6 sm:mt-8 sm:!px-8 sm:!py-4 sm:!text-base flex items-center justify-center gap-2"
            disabled={app.otpCode.length !== 4}
            onClick={app.handleVerifyOTP}
          >
            verify & go <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
