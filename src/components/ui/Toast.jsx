import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

export default function Toast() {
  const app = useApp();
  const toast = app.toast;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[min(400px,92vw)] pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="pointer-events-auto bg-white/80 backdrop-blur-xl border border-white shadow-premium rounded-[20px] p-4 flex items-start gap-3 relative overflow-hidden"
          >
            {toast.type === 'success' && <div className="absolute inset-y-0 left-0 w-1.5 bg-brand-grassFresh" />}
            {toast.type === 'error' && <div className="absolute inset-y-0 left-0 w-1.5 bg-red-500" />}
            {toast.type === 'info' && <div className="absolute inset-y-0 left-0 w-1.5 bg-blue-500" />}
            
            <div className="flex-1 min-w-0 pl-1">
              {toast.title && <p className="font-bold text-sm text-brand-forest">{toast.title}</p>}
              <p className="text-sm text-slate-600 font-medium">{toast.message}</p>
            </div>
            
            <button onClick={() => app.dismissToast()} className="text-slate-400 hover:text-slate-700 transition shrink-0 p-1 bg-slate-100/50 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
