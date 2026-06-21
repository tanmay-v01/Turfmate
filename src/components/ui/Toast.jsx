import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const STYLES = {
  success: 'border-brand-grassFresh/40 bg-white',
  error: 'border-red-200 bg-white',
  info: 'border-slate-200 bg-white',
};

export default function Toast() {
  const app = useApp();
  const toast = app.toast;
  if (!toast) return null;

  const Icon = ICONS[toast.type] || Info;
  const iconColor = toast.type === 'success' ? 'text-brand-grassDeep' : toast.type === 'error' ? 'text-red-500' : 'text-slate-500';

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[min(420px,92vw)] animate-fade-up">
      <div className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg ${STYLES[toast.type] || STYLES.info}`}>
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
        <div className="flex-1 min-w-0">
          {toast.title && <p className="font-bold text-sm text-brand-forest">{toast.title}</p>}
          <p className="text-sm text-slate-600 mt-0.5">{toast.message}</p>
        </div>
        <button onClick={() => app.dismissToast()} className="text-slate-400 hover:text-slate-600 shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
