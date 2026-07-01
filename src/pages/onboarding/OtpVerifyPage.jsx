import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, RefreshCw, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import TurfMateLogo from '../../components/ui/TurfMateLogo';
import GrassBackground from '../../components/ui/GrassBackground';

export default function OtpVerifyPage() {
  const app = useApp();
  const [code, setCode] = useState(['', '', '', '']);
  const inputs = useRef([]);
  const [localTimer, setLocalTimer] = useState(app.loginTimer || 30);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    let interval;
    if (localTimer > 0) {
      interval = setInterval(() => setLocalTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [localTimer]);

  useEffect(() => {
    const fullCode = code.join('');
    if (fullCode.length === 4) {
      app.setOtpCode(fullCode);
      setIsVerifying(true);
      setTimeout(() => {
        app.handleVerifyOTP().finally(() => setIsVerifying(false));
      }, 300);
    }
  }, [code, app]);

  const handleChange = (index, value) => {
    if (isVerifying) return;
    if (!/^[0-9]*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value !== '' && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (isVerifying) return;
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleResend = (whatsapp = false) => {
    setCode(['', '', '', '']);
    setLocalTimer(30);
    inputs.current[0]?.focus();
    app.handleSendOTP(whatsapp);
  };

  return (
    <div className="tm-auth-split relative min-h-[100dvh] bg-[#FAFBFC]">
      <GrassBackground />

      <div className="tm-auth-visual bg-emerald-950 text-white">
        <img
          src="https://images.unsplash.com/photo-1518605368461-1ee7c5320c24?auto=format&fit=crop&q=80&w=1200"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-900/60 to-transparent" />
        <div className="relative z-10 p-12 max-w-lg animate-fade-up-slow">
          <TurfMateLogo size="md" className="mb-8" />
          <h2 className="text-4xl font-display font-black text-white leading-tight lowercase">
            almost <span className="text-emerald-400">done.</span>
          </h2>
          <div className="mt-6 flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-400" />
            <p className="text-emerald-100/80 font-medium text-sm">secure passwordless entry.</p>
          </div>
        </div>
      </div>

      <div className="tm-auth-form bg-white/50 backdrop-blur-sm">
        <div className="w-full max-w-md mx-auto animate-pop flex flex-col min-h-0 lg:justify-center relative">
          {isVerifying && (
            <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[2px] rounded-3xl flex items-center justify-center animate-fade-in">
              <div className="flex flex-col items-center">
                <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className="mt-3 text-sm font-bold text-emerald-600">verifying...</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6 lg:hidden">
            <button
              onClick={() => app.navigateTo('login')}
              disabled={isVerifying}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 shrink-0 transition"
            >
              <ArrowLeft className="w-4 h-4" /> back
            </button>
            <TurfMateLogo size="sm" />
            <div className="w-12" aria-hidden />
          </div>

          <button
            onClick={() => app.navigateTo('login')}
            disabled={isVerifying}
            className="hidden lg:flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" /> back
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-200 w-fit mb-2 sm:mb-3">verification</span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800 lowercase leading-tight">
            enter code
          </h1>
          <p className="mt-1 sm:mt-2 text-slate-500 text-xs sm:text-sm">
            sent to <span className="font-bold text-slate-700">{app.phoneNumber}</span>
          </p>

          <div className="mt-8 sm:mt-10">
            <div className="flex justify-center gap-3 sm:gap-4 max-w-[280px] mx-auto">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={(el) => (inputs.current[index] = el)}
                  type="tel"
                  maxLength={1}
                  value={code[index]}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isVerifying}
                  className="w-14 h-16 sm:w-16 sm:h-20 text-center text-3xl sm:text-4xl font-display font-black bg-white border-2 border-slate-200 text-slate-800 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-sm"
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>

            <div className="mt-8 text-center flex flex-col items-center gap-4">
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                didn&apos;t get it?{' '}
                {localTimer > 0 ? (
                  <span className="text-slate-400 font-bold">wait {localTimer}s</span>
                ) : (
                  <button onClick={() => handleResend(false)} disabled={isVerifying} className="font-bold text-emerald-600 hover:underline pb-0.5 border-b border-dashed border-emerald-600/30">
                    resend sms
                  </button>
                )}
              </p>
              
              {!app.phoneNumber.includes('@') && localTimer === 0 && (
                <button onClick={() => handleResend(true)} disabled={isVerifying} className="px-3 py-1 rounded-full bg-[#25D366] text-white text-[10px] sm:text-xs font-black shadow-sm hover:scale-[1.02] active:scale-[0.98] transition">
                  get via whatsapp instead
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
