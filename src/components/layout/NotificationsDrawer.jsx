import { Bell, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationsDrawer() {
  const app = useApp();

  return (
    <AnimatePresence>
      {app.showNotifications && (
        <div className="fixed inset-0 z-50 lg:pl-[252px]">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-forestSoft/20 dark:bg-slate-900/40 backdrop-blur-sm" 
            onClick={() => app.setShowNotifications(false)} 
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-0 right-0 w-full max-w-md h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-premium flex flex-col border-l border-brand-border dark:border-slate-800"
          >
            <div className="flex items-center justify-between p-6 border-b border-brand-border dark:border-slate-800">
              <h3 className="font-display font-extrabold text-lg text-brand-forest dark:text-brand-grassLight flex items-center gap-2 lowercase">
                <Bell className="w-5 h-5 text-brand-grassFresh" /> pings
              </h3>
              <button onClick={() => app.setShowNotifications(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-brand-muted dark:text-slate-400 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {app.notifications.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 px-4">
                  <p className="text-4xl mb-2">🔔</p>
                  <p className="font-bold text-brand-forest dark:text-slate-200">All caught up</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Bookings and squad updates will appear here.</p>
                </motion.div>
              ) : app.notifications.map((n, i) => (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={n.id}
                  onClick={() => app.setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)))}
                  className={`w-full text-left p-4 rounded-[20px] border transition-all duration-300 ${
                    n.read 
                      ? 'bg-white/50 dark:bg-slate-800/30 border-brand-border dark:border-slate-700/50' 
                      : 'bg-brand-grassPale dark:bg-brand-forest/20 border-brand-grassFresh/40 dark:border-brand-grassDeep/40 shadow-soft'
                  }`}
                >
                  <p className={`text-sm font-medium ${n.read ? 'text-brand-muted dark:text-slate-400' : 'text-brand-forest dark:text-brand-grassLight'}`}>{n.text}</p>
                  <span className="text-xs text-brand-muted dark:text-slate-500 mt-2 block">{n.time}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
