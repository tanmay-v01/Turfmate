import {
  Home,
  MessageSquare,
  Trophy,
  User,
  Menu,
  X,
  Search,
  Bell,
  Wallet,
  Settings,
  HelpCircle,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import TurfMateLogo from '../../components/ui/TurfMateLogo';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'split_hub', label: 'Split Hub', icon: Wallet, badge: 'new' },
  { id: 'chat', label: 'Inbox', icon: MessageSquare, badge: '3' },
  { id: 'tournaments', label: 'Compete', icon: Trophy },
  { id: 'locker_room', label: 'Locker', icon: User },
];

export default function AppNav() {
  const app = useApp();
  const currentView = app.view;

  return (
    <>
      {/* MOBILE BOTTOM DOCK (Light Glass) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom tm-stagger px-4 pb-4 pt-2">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-[32px] px-2 py-2 flex items-center justify-between shadow-[0_8px_32px_rgba(15,23,42,0.08)]">
          {NAV_ITEMS.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => app.setView(item.id)}
                className={`relative flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'text-emerald-600 bg-emerald-50' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="mobileNavIndicator"
                    className="absolute inset-0 bg-emerald-50 rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 mb-0.5' : ''}`} />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center px-1 bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white">
                      {item.badge === 'new' ? '' : item.badge}
                    </span>
                  )}
                </div>
                {isActive && (
                  <span className="text-[10px] font-bold leading-none tracking-tight">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* DESKTOP SIDEBAR (Light Panel) */}
      <div className="hidden lg:flex fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-slate-200 flex-col z-40 shadow-[4px_0_24px_rgba(15,23,42,0.02)]">
        {/* Brand Header */}
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <TurfMateLogo size="sm" />
            <span className="font-display font-extrabold text-xl text-slate-800 tracking-tight lowercase">
              turfmate
            </span>
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="flex-1 overflow-y-auto py-8 px-4 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => app.setView(item.id)}
                className={`w-full relative flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 group ${
                  isActive 
                    ? 'text-emerald-700 bg-emerald-50' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="desktopNavIndicator"
                    className="absolute inset-0 bg-emerald-50 rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    item.badge === 'new' 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button 
            onClick={() => app.setShowAvatarPicker(true)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all text-left group"
          >
            <img 
              src={app.userProfile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${app.userProfile?.fullName || 'User'}`} 
              alt="Avatar" 
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 object-cover group-hover:scale-105 transition-transform"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate leading-tight">
                {app.userProfile?.fullName || 'Guest User'}
              </p>
              <p className="text-[11px] font-semibold text-slate-500 truncate mt-0.5">
                {app.userProfile?.username || '@guest'}
              </p>
            </div>
            <Settings className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </button>
        </div>
      </div>
    </>
  );
}
