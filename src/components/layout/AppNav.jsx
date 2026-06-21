import { Compass, MapPin, Users, MessageSquare, Search, Trophy, Timer, Medal, UserPlus, Pencil } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import TurfMateLogo from '../ui/TurfMateLogo';
import { NAV_ICON_ACCENTS } from '../../utils/colorAccents';

const NAV_ITEMS = [
  { id: 'home', label: 'Explore', icon: Compass, views: ['home', 'turf_details', 'search_engine', 'squad', 'leaderboard', 'score_calculator', 'split_hub', 'radar', 'tournaments'] },
  { id: 'play_radius', label: 'Map', icon: MapPin, views: ['play_radius', 'location_manual'] },
  { id: 'locker_room', label: 'Locker', icon: Users, views: ['locker_room'] },
  { id: 'chat', label: 'Chat', icon: MessageSquare, views: ['chat'] },
];

const QUICK_LINKS = [
  { id: 'squad', label: 'Squad', icon: UserPlus },
  { id: 'leaderboard', label: 'Ranks', icon: Trophy },
  { id: 'score_calculator', label: 'Score', icon: Timer },
  { id: 'tournaments', label: 'Events', icon: Medal },
];

function isActive(view, item) {
  return item.views.includes(view);
}

export default function AppNav() {
  const app = useApp();
  const unread = app.chats.reduce((sum, c) => sum + (c.unread || 0), 0);

  const go = (id) => {
    if (id === 'home') app.setView('home');
    else app.setView(id);
  };

  const openSearch = () => {
    app.setSearchViewMode('list');
    app.setView('search_engine');
  };

  return (
    <>
      {/* Desktop sidebar — frosted glass */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[248px] flex-col z-40 px-4 py-7 glass-sidebar">

        <div className="flex items-center gap-3 mb-8 px-1">
          <div className="p-1.5 rounded-2xl bg-brand-grassPale/80 border border-white/60 shadow-sm">
            <TurfMateLogo size="sm" />
          </div>
          <div>
            <p className="font-display font-extrabold text-base text-brand-forest leading-none tracking-tight">TurfMate</p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">book · play · squad</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(app.view, item);
            const iconAccent = NAV_ICON_ACCENTS[item.id];
            return (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'tm-nav-primary text-white shadow-md'
                    : 'text-slate-600 hover:text-brand-forest hover:bg-white/50'
                }`}
              >
                <span className={`flex items-center justify-center w-8 h-8 rounded-xl border ${active ? 'bg-white/20 border-white/20' : `${iconAccent} border-transparent`}`}>
                  <Icon className={`w-[17px] h-[17px] ${active ? 'text-white' : ''}`} strokeWidth={2.25} />
                </span>
                {item.label}
                {item.id === 'chat' && unread > 0 && (
                  <span className="ml-auto min-w-[1.25rem] h-5 px-1.5 bg-brand-lime text-brand-forest text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="glass-card p-3 mt-3 space-y-0.5">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-2">Tools</p>
          {QUICK_LINKS.map((item) => {
            const Icon = item.icon;
            const active = app.view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => app.setView(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition ${
                  active ? 'bg-brand-grassPale/90 text-brand-forest' : 'text-slate-500 hover:bg-white/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={2.25} />
                {item.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={openSearch}
          className="mt-3 w-full flex items-center gap-2.5 px-3.5 py-3 rounded-2xl tm-gradient-book text-white text-sm font-semibold hover:scale-[1.01] transition group shadow-lg"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/20 shrink-0">
            <Search className="w-4 h-4" strokeWidth={2.5} />
          </span>
          <span className="text-left">
            <span className="block font-bold">Find a turf</span>
            <span className="block text-[10px] text-white/80 font-medium">search & map view</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => app.setShowAvatarPicker(true)}
          className="mt-4 pt-4 border-t border-white/50 flex items-center gap-3 w-full text-left hover:bg-white/40 px-2 py-2.5 rounded-2xl transition group"
        >
          <div className="relative shrink-0">
            <img src={app.userProfile.avatar} alt="" className="w-10 h-10 rounded-xl border border-white/80 object-cover shadow-sm ring-1 ring-brand-grassFresh/30" />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand-forest text-white flex items-center justify-center shadow-md ring-2 ring-white">
              <Pencil className="w-2 h-2" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-brand-forest truncate">{app.userProfile.name}</p>
            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              {app.userProfile.location || 'Set location'}
            </p>
          </div>
        </button>
      </aside>

      {/* Mobile — frosted bottom dock */}
      <>
        <div className="glass-nav-fade lg:hidden" aria-hidden />
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 safe-bottom pointer-events-none">
          <div className="px-3 pb-3 pt-1 pointer-events-auto max-w-lg mx-auto">
            <div className="glass-nav-shell">
              <button
                type="button"
                onClick={openSearch}
                className="flex items-center gap-3 w-full mb-2 px-3 py-2.5 rounded-[18px] tm-gradient-book text-left transition active:scale-[0.99] shadow-md"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 text-white shrink-0">
                  <Search className="w-4 h-4" strokeWidth={2.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">Find a turf</p>
                  <p className="text-[10px] text-white/80 truncate">{app.filterRadius}km · {app.userProfile.location || 'near you'}</p>
                </div>
              </button>

              <div className="flex items-center justify-between gap-0.5">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(app.view, item);
                  const iconAccent = NAV_ICON_ACCENTS[item.id];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => go(item.id)}
                      className={`glass-nav-item flex-1 ${active ? 'glass-nav-item-active' : ''}`}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition ${active ? 'bg-white/20' : iconAccent}`}>
                        <Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2.5 : 2} />
                        {item.id === 'chat' && unread > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-brand-lime text-brand-forest text-[8px] font-black flex items-center justify-center ring-2 ring-white shadow-sm">
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                      </span>
                      <span className="text-[9px] font-semibold tracking-wide">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>
      </>
    </>
  );
}
