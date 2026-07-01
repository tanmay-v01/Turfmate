import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { isIos, isStandalone } from '../../utils/pwa';

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [showIosHint, setShowIosHint] = useState(false);
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

  useEffect(() => {
    if (!dismissed && isIos() && !isStandalone()) {
      setShowIosHint(true);
    }
  }, [dismissed]);

  const visible = !dismissed && (deferred || showIosHint);
  if (!visible) return null;

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice.catch(() => {});
    setDeferred(null);
  };

  const dismiss = () => {
    setDismissed(true);
    setShowIosHint(false);
    try {
      localStorage.setItem('tm_pwa_dismissed', '1');
    } catch {
      /* ignore */
    }
    setDeferred(null);
  };

  const isAndroidInstall = Boolean(deferred);

  return (
    <div className="fixed bottom-[148px] lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:max-w-sm z-40 animate-fade-up">
      <div className="bg-white/5 border border-brand-grassLight rounded-2xl shadow-lg p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center shrink-0">
          {isAndroidInstall ? (
            <Download className="w-5 h-5 text-lime-400" />
          ) : (
            <Share className="w-5 h-5 text-lime-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-white">Install TurfMate</p>
          {isAndroidInstall ? (
            <>
              <p className="text-xs text-slate-500 mt-0.5">Add to home screen for faster bookings.</p>
              <button
                type="button"
                onClick={install}
                className="mt-2 text-xs font-black text-lime-400 hover:underline"
              >
                Install app →
              </button>
            </>
          ) : (
            <p className="text-xs text-slate-500 mt-0.5">
              Tap <span className="font-bold text-white">Share</span> in Safari, then{' '}
              <span className="font-bold text-white">Add to Home Screen</span>.
            </p>
          )}
        </div>
        <button type="button" onClick={dismiss} className="p-1 text-slate-400 hover:text-slate-600" aria-label="Dismiss">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
