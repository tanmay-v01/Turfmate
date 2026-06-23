import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem('tm_pwa_dismissed') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const onInstallable = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener('beforeinstallprompt', onInstallable);
    return () => window.removeEventListener('beforeinstallprompt', onInstallable);
  }, []);

  if (!deferred || dismissed) return null;

  const install = async () => {
    deferred.prompt();
    await deferred.userChoice.catch(() => {});
    setDeferred(null);
  };

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem('tm_pwa_dismissed', '1');
    } catch {
      /* ignore */
    }
    setDeferred(null);
  };

  return (
    <div className="fixed bottom-[148px] lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:max-w-sm z-40 animate-fade-up">
      <div className="bg-white border border-brand-grassLight rounded-2xl shadow-lg p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-grassPale flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-brand-grassDeep" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-brand-forest">Install TurfMate</p>
          <p className="text-xs text-slate-500 mt-0.5">Add to home screen for faster bookings.</p>
          <button
            type="button"
            onClick={install}
            className="mt-2 text-xs font-black text-brand-grassDeep hover:underline"
          >
            Install app →
          </button>
        </div>
        <button type="button" onClick={dismiss} className="p-1 text-slate-400 hover:text-slate-600" aria-label="Dismiss">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
