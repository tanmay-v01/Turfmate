import { Bell, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function NotificationsDrawer() {
  const app = useApp();
  if (!app.showNotifications) return null;

  return (
    <div className="fixed inset-0 z-50 lg:pl-[252px]">
      <div className="absolute inset-0 bg-brand-forestSoft/10 backdrop-blur-sm" onClick={() => app.setShowNotifications(false)} />
      <div className="absolute top-0 right-0 w-full max-w-md h-full glass-grass shadow-premium animate-slide-in flex flex-col border-l border-brand-grassLight">
        <div className="flex items-center justify-between p-6 border-b border-brand-border">
          <h3 className="font-display font-extrabold text-lg text-brand-forest flex items-center gap-2 lowercase">
            <Bell className="w-5 h-5 text-brand-grassFresh" /> pings
          </h3>
          <button onClick={() => app.setShowNotifications(false)} className="p-2 rounded-full hover:bg-brand-grassPale text-brand-muted transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {app.notifications.length === 0 ? (
            <div className="text-center py-16 px-4">
              <p className="text-4xl mb-2">🔔</p>
              <p className="font-bold text-brand-forest">All caught up</p>
              <p className="text-sm text-slate-500 mt-1">Bookings and squad updates will appear here.</p>
            </div>
          ) : app.notifications.map((n, i) => (
            <button
              key={n.id}
              onClick={() => app.setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)))}
              style={{ animationDelay: `${i * 0.05}s` }}
              className={`w-full text-left p-4 rounded-[20px] border transition-all duration-300 animate-fade-up ${
                n.read ? 'bg-white/50 border-brand-border' : 'bg-brand-grassPale border-brand-grassFresh/40 shadow-soft'
              }`}
            >
              <p className={`text-sm font-medium ${n.read ? 'text-brand-muted' : 'text-brand-forest'}`}>{n.text}</p>
              <span className="text-xs text-brand-muted mt-2 block">{n.time}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
