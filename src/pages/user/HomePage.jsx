import {
  MapPin, Bell, Search, Star, ArrowRight, Sparkles, Calendar, Trophy, Users, Zap, TrendingUp, ChevronRight, Timer, Navigation, Pencil, UserPlus, LayoutGrid, Medal, Flame, User,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { LEADERBOARD_METRICS, getFriendIds } from '../../data/leaderboardData';
import { MOCK_PLAYERS, SPORTS } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import LiveTicker from '../../components/ui/LiveTicker';
import EmptyState from '../../components/ui/EmptyState';
import TurfImage from '../../components/ui/TurfImage';
import { IMAGES } from '../../data/images';
import { SPORT_COLORS, INFO_ACCENTS } from '../../utils/colorAccents';
import { HomeSkeleton } from '../../components/ui/Skeleton';

const TICKER = [
  '6 slots open tonight in Virar',
  'Rahul posted a 7v7 split — 2 spots left',
  'Green Valley surge pricing till 9 PM',
  '12 players active within 5 km',
  'Kanakia Hub — 20% off morning slots',
];


const HERO_FALLBACK = IMAGES.arena;

const QUICK_ACTIONS = [
  {
    label: 'book',
    desc: 'find slots',
    icon: Zap,
    image: IMAGES.night,
    overlay: 'bg-gradient-to-t from-brand-forest via-brand-forest/70 to-transparent',
    iconClass: 'bg-white/20 text-white border border-white/30',
    action: (app) => { app.setSearchViewMode('list'); app.setView('search_engine'); },
  },
  {
    label: 'join',
    desc: 'live games',
    icon: Users,
    image: IMAGES.football,
    overlay: 'bg-gradient-to-t from-slate-950/95 via-slate-900/55 to-slate-900/5',
    iconClass: 'bg-amber-500/35 text-amber-50 border border-amber-200/40',
    action: (app) => app.setView('locker_room'),
    badgeKey: 'splits',
  },
  {
    label: 'squad',
    desc: 'your crew',
    icon: UserPlus,
    image: IMAGES.squad,
    overlay: 'bg-gradient-to-t from-sky-950/95 via-sky-900/50 to-transparent',
    iconClass: 'bg-sky-500/35 text-sky-50 border border-sky-200/40',
    action: (app) => app.setView('squad'),
  },
];

export default function HomePage() {
  const app = useApp();
  const lat1 = app.userProfile?.lat || 19.456;
  const lng1 = app.userProfile?.lng || 72.812;

  const availableTurfs = app.turfs.filter(t => !app.suspendedTurfIds.includes(t.id) && t.status !== 'pending_review');
  const nearTurfs = availableTurfs.filter((t) => app.getDistance(lat1, lng1, t.lat, t.lng) <= app.filterRadius);
  const filteredTurfs = app.selectedSportFilter === 'all'
    ? nearTurfs
    : nearTurfs.filter((t) => t.sports.includes(app.selectedSportFilter));
  const featured = filteredTurfs[0] || nearTurfs[0] || availableTurfs[0];

  useEffect(() => {
    // Request push notification permissions on home mount if not determined yet
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Smooth scroll if returning from turf details
    if (app.returnScrollPos > 0) {
      window.scrollTo(0, app.returnScrollPos);
      app.setReturnScrollPos(0);
    }
  }, [app]);

  const openSplits = app.announcements.filter((a) => {
    const turf = availableTurfs.find((t) => t.id === a.turfId);
    if (!turf) return false;
    return app.getDistance(app.userProfile.lat || 19.456, app.userProfile.lng || 72.812, turf.lat, turf.lng) <= app.filterRadius && a.status === 'open';
  });

  const nearbyPlayers = MOCK_PLAYERS.filter((p) => parseFloat(p.distance) <= app.filterRadius + 2).slice(0, 6);
  const nextBooking = app.bookings[0];
  const firstName = app.userProfile.name?.split(' ')[0] || 'player';
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const goSearch = () => { app.setSearchViewMode('list'); app.setView('search_engine'); };

  const favSport = app.userProfile.favoriteSports?.[0] || 'football';
  const rankKey = LEADERBOARD_METRICS[favSport]?.primary?.key || 'goals';
  const friendIds = getFriendIds();
  const myRank = (() => {
    const ranked = (app.friendStats || [])
      .filter((p) => friendIds.includes(p.id))
      .sort((a, b) => (b.stats[favSport]?.[rankKey] ?? 0) - (a.stats[favSport]?.[rankKey] ?? 0));
    const idx = ranked.findIndex((p) => p.isMe);
    return idx >= 0 ? idx + 1 : '—';
  })();

  if (!app.turfs || app.turfs.length === 0) {
    return <HomeSkeleton />;
  }

  return (
    <div className="w-full pb-10">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-transparent pointer-events-none" />
        <div className="tm-page pt-5 pb-5 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => app.setShowAvatarPicker(true)}
                className="relative group shrink-0"
                aria-label="Change avatar"
              >
                <img
                  src={app.userProfile.avatar}
                  alt=""
                  className="w-11 h-11 rounded-2xl border border-white/80 object-cover shadow-sm ring-2 ring-brand-grassFresh/25 group-hover:ring-brand-grassFresh/50 transition"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand-forest text-white flex items-center justify-center shadow-md ring-2 ring-white">
                  <Pencil className="w-2 h-2" />
                </span>
              </button>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{timeGreeting}</p>
                <p className="font-display font-extrabold lowercase text-lg tracking-tight text-brand-forest">{firstName}</p>
              </div>
            </div>
            <button
              onClick={() => app.setShowNotifications(!app.showNotifications)}
              className="glass-card !rounded-2xl w-11 h-11 flex items-center justify-center relative hover:shadow-md transition"
            >
              <Bell className="w-[18px] h-[18px] text-brand-forest" strokeWidth={2} />
              {app.notifications.some((n) => !n.read) && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>
          </div>

          {/* Live status strip */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
            {[
              { icon: MapPin, label: `${app.filterRadius} km radius`, accent: INFO_ACCENTS.sky },
              { icon: Sparkles, label: `${nearTurfs.length} turfs nearby`, accent: INFO_ACCENTS.green },
              { icon: Users, label: `${openSplits.length} live splits`, accent: INFO_ACCENTS.amber },
              { icon: Trophy, label: `rank #${myRank}`, accent: INFO_ACCENTS.violet },
            ].map((chip) => (
              <span key={chip.label} className="tm-info-chip shrink-0">
                <span className={`flex items-center justify-center w-5 h-5 rounded-md ${chip.accent}`}>
                  <chip.icon className="w-3 h-3" strokeWidth={2.5} />
                </span>
                {chip.label}
              </span>
            ))}
          </div>

          <div className="glass-card overflow-hidden !p-0 !rounded-[22px]">
            {/* Mobile: full-width hero image on top */}
            <button
              type="button"
              onClick={() => { if (featured) { app.setActiveTurfId(featured.id); app.setView('turf_details'); } }}
              className="relative block w-full h-40 md:hidden overflow-hidden"
            >
              <TurfImage
                turf={featured}
                fallback={HERO_FALLBACK}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                <div className="text-left text-white min-w-0">
                  <p className="text-[10px] font-bold uppercase opacity-90">featured turf</p>
                  <p className="font-display font-extrabold text-lg lowercase truncate">{featured?.name || 'nearby pitch'}</p>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-full bg-white/95 text-[10px] font-black text-brand-forest uppercase">
                  from ₹{featured?.pricePerHour || '800'}/hr
                </span>
              </div>
            </button>

            <div className="grid md:grid-cols-[1fr,220px]">
              <div className="p-4 sm:p-6 md:p-7">
                <span className="tm-info-chip inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide mb-4">
                  <span className="w-5 h-5 rounded-md tm-icon-accent-green flex items-center justify-center shrink-0">
                    <Sparkles className="w-3 h-3" />
                  </span>
                  {nearTurfs.length} turfs · {openSplits.length} live games
                </span>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-extrabold text-brand-forest leading-tight lowercase">
                  ready to play, {firstName}?
                </h1>
                <p className="mt-2 text-sm text-slate-500 max-w-sm leading-relaxed">
                  book a pitch, join a split, or squad up — all within your play radius.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button onClick={goSearch} className="inline-flex items-center gap-2 px-5 py-2.5 tm-btn-primary rounded-full text-sm font-bold transition hover:scale-[1.02] w-full sm:w-auto justify-center">
                    <Zap className="w-4 h-4" /> book now
                  </button>
                  <button
                    onClick={() => app.setView('play_radius')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 tm-btn-secondary rounded-full text-sm font-bold transition hover:scale-[1.02] max-w-full min-w-0"
                  >
                    <MapPin className="w-4 h-4 text-brand-grassDeep shrink-0" />
                    <span className="truncate">{app.userProfile.location || 'Set location'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => app.refreshUserLocation()}
                    disabled={app.isLocating}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-full text-xs font-bold tm-btn-secondary disabled:opacity-50 transition"
                    title="Refresh GPS"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${app.isLocating ? 'animate-spin' : ''}`} />
                    {app.isLocating ? 'gps…' : 'gps'}
                  </button>
                </div>
              </div>
              {/* Desktop hero image */}
              <button
                type="button"
                onClick={() => { if (featured) { app.setActiveTurfId(featured.id); app.setView('turf_details'); } }}
                className="relative hidden md:block min-h-[200px] bg-brand-grassPale"
              >
                <TurfImage
                  turf={featured}
                  fallback={HERO_FALLBACK}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/30" />
                <div className="absolute bottom-4 right-4 text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur text-[10px] font-bold uppercase shadow-sm">
                    <Flame className="w-3 h-3" /> featured
                  </span>
                  <p className="mt-2 text-xs font-bold text-white drop-shadow-md truncate max-w-[180px]">{featured?.name}</p>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <button
            onClick={goSearch}
            className="mt-4 w-full flex items-center gap-3 glass-card rounded-2xl px-4 py-3.5 text-left hover:shadow-md transition lg:hidden"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-xl tm-icon-accent-green shrink-0">
              <Search className="w-4 h-4 text-brand-forest" strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-brand-forest">Search turfs</p>
              <p className="text-[11px] text-slate-400 truncate">sports, areas, landmarks…</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 ml-auto shrink-0" />
          </button>
        </div>
      </section>

      <div className="tm-page space-y-8 pt-6">
        <LiveTicker items={TICKER} />

        {/* Quick actions — photo cards */}
        <section aria-label="Quick actions">
          <div className="tm-action-grid">
            {QUICK_ACTIONS.map((item) => {
              const badge = item.badgeKey === 'splits' && openSplits.length > 0
                ? `${openSplits.length} live`
                : null;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => item.action(app)}
                  className="tm-action-card group"
                  aria-label={`${item.label}: ${item.desc}`}
                >
                  <img src={item.image} alt="" className="tm-action-card__img" loading="lazy" decoding="async" />
                  <div className={`tm-action-card__overlay ${item.overlay}`} aria-hidden />
                  {badge && (
                    <span className="tm-action-card__badge">{badge}</span>
                  )}
                  <div className="tm-action-card__body">
                    <span className={`tm-action-card__icon ${item.iconClass}`}>
                      <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.25} />
                    </span>
                    <span className="tm-action-card__label">{item.label}</span>
                    <span className="tm-action-card__desc">{item.desc}</span>
                  </div>
                  <ChevronRight className="tm-action-card__arrow" aria-hidden />
                </button>
              );
            })}
          </div>
        </section>

        {/* Stats */}
        <div className="tm-stat-grid">
          {[
            { icon: Calendar, label: 'your bookings', value: app.bookings.length, sub: 'view upcoming', stripe: 'tm-stripe-sky', accent: INFO_ACCENTS.sky, action: () => { if (nextBooking) { app.setActiveTurfId(nextBooking.turfId); app.setView('turf_details'); } else goSearch(); } },
            { icon: Users, label: 'live splits', value: openSplits.length, sub: 'joinable now', stripe: 'tm-stripe-amber', accent: INFO_ACCENTS.amber, action: () => app.setView('locker_room') },
            { icon: Trophy, label: 'squad ranks', value: `#${myRank}`, sub: 'tap to view', stripe: 'tm-stripe-violet', accent: INFO_ACCENTS.violet, action: () => app.setView('leaderboard') },
            { icon: MapPin, label: 'play radius', value: `${app.filterRadius}km`, sub: 'search zone', stripe: 'tm-stripe-green', accent: INFO_ACCENTS.green, action: () => app.setView('play_radius') },
          ].map((stat) => (
            <button
              key={stat.label}
              type="button"
              onClick={stat.action || undefined}
              disabled={!stat.action}
              className={`tm-stat-card glass-card tm-card-color ${stat.stripe} transition hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] ${
                stat.action ? 'cursor-pointer' : ''
              }`}
            >
              <div className={`tm-stat-icon ${stat.accent}`}>
                <stat.icon className="w-4 h-4" strokeWidth={2.25} />
              </div>
              <p className="tm-stat-value">{stat.value}</p>
              <p className="tm-stat-label">{stat.label}</p>
              <p className="tm-stat-sub">{stat.sub}</p>
            </button>
          ))}
        </div>

        {/* Score + leaderboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => app.setView('score_calculator')}
            className="glass-card tm-card-color tm-stripe-green p-4 sm:p-5 flex items-center gap-3 sm:gap-4 text-left group hover:shadow-md transition"
          >
            <div className="w-14 h-14 rounded-2xl tm-icon-accent-green flex items-center justify-center shrink-0">
              <Timer className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <p className="font-display font-extrabold text-brand-forest lowercase">live score</p>
              <p className="text-sm text-slate-400">cricket + football calculator</p>
              {app.liveGame && (
                <span className="inline-flex mt-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold uppercase">match in progress</span>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-brand-grassDeep transition" />
          </button>
          <button
            onClick={() => app.setView('leaderboard')}
            className="glass-card tm-card-color tm-stripe-amber p-4 sm:p-5 flex items-center gap-3 sm:gap-4 text-left group hover:shadow-md transition"
          >
            <div className="w-14 h-14 rounded-2xl tm-icon-accent-amber flex items-center justify-center shrink-0">
              <Trophy className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <p className="font-display font-extrabold text-brand-forest lowercase">friend leaderboard</p>
              <p className="text-sm text-slate-400">goals, runs, wickets & more</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-brand-grassDeep transition" />
          </button>
          <button
            onClick={() => app.setView('tournaments')}
            className="glass-card tm-card-color tm-stripe-violet p-4 sm:p-5 flex items-center gap-3 sm:gap-4 text-left group hover:shadow-md transition"
          >
            <div className="w-14 h-14 rounded-2xl tm-icon-accent-violet flex items-center justify-center shrink-0">
              <Medal className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <p className="font-display font-extrabold text-brand-forest lowercase">tournaments</p>
              <p className="text-sm text-slate-400">compete & win prizes</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-brand-grassDeep transition" />
          </button>
        </div>

        {/* Turf image strip */}
        {nearTurfs.length > 0 && (
          <section>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
              {nearTurfs.slice(0, 5).map((turf) => (
                <button
                  key={turf.id}
                  onClick={() => { app.setActiveTurfId(turf.id); app.setView('turf_details'); }}
                  className="relative shrink-0 w-36 h-48 rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition group"
                >
                  <TurfImage turf={turf} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-left">
                    <p className="text-white font-bold text-xs truncate">{turf.name}</p>
                    <p className="text-white/80 text-[10px] font-bold">₹{turf.pricePerHour}/hr</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Sport filters */}
        <section>
          <h2 className="tm-section-heading mb-3">pick your sport</h2>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => app.setSelectedSportFilter('all')}
              className={`tm-chip shrink-0 ${app.selectedSportFilter === 'all' ? SPORT_COLORS.all.active : SPORT_COLORS.all.chip}`}
            >
              all sports
            </button>
            {SPORTS.map((s) => {
              const colors = SPORT_COLORS[s.id] || SPORT_COLORS.all;
              const active = app.selectedSportFilter === s.id;
              return (
              <button
                key={s.id}
                onClick={() => app.setSelectedSportFilter(s.id)}
                className={`tm-chip shrink-0 ${active ? colors.active : colors.chip}`}
              >
                {s.name}
              </button>
              );
            })}
          </div>
        </section>

        {/* Next booking + featured */}
        <div className="grid lg:grid-cols-2 gap-4">
          {nextBooking ? (
            <div className="glass-card p-5 flex gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
                <TurfImage
                  turf={availableTurfs.find((t) => t.id === nextBooking.turfId) || featured}
                  src={nextBooking.image}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase text-brand-grassDeep tracking-wide">up next</span>
                <h3 className="font-display font-extrabold text-brand-forest text-lg lowercase truncate">{nextBooking.turfName}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{nextBooking.date} · {nextBooking.slotTime}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <button onClick={() => app.setView('split_hub')} className="text-[10px] font-bold text-brand-grassDeep uppercase hover:underline">split hub</button>
                  <span className="font-bold text-brand-forest">₹{nextBooking.paidAmount}</span>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              image={IMAGES.pitch}
              title="no bookings yet"
              description="Find a turf and lock your first slot tonight."
              actionLabel="book a turf"
              onAction={goSearch}
            />
          )}

          {featured && (
          <div
            className="relative overflow-hidden glass-card !p-0 cursor-pointer group min-h-[180px] hover:shadow-lg transition"
            onClick={() => { app.setActiveTurfId(featured.id); app.setView('turf_details'); }}
          >
            <TurfImage turf={featured} fallback={HERO_FALLBACK} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-[10px] font-bold w-fit mb-2">
                <TrendingUp className="w-3 h-3" /> trending
              </span>
              <h3 className="font-display font-extrabold text-xl lowercase">{featured.name}</h3>
              <p className="text-sm text-white/85 mt-0.5">from ₹{featured.pricePerHour}/hr · {featured.rating}★</p>
              <span className="inline-flex items-center gap-1 mt-2 text-sm font-bold text-brand-grassLight">
                view slots <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>
          )}
        </div>

        {/* Secondary quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Zap, label: 'instant book', sub: 'grab a slot', action: goSearch },
            { icon: Users, label: 'join splits', sub: `${openSplits.length} lobbies`, action: () => app.setView('locker_room') },
            { icon: LayoutGrid, label: 'radius map', sub: 'find players', action: () => app.setView('play_radius') },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="tm-card-hover flex items-center gap-4 p-4 text-left group glass-card !rounded-2xl"
            >
              <div className="w-11 h-11 rounded-xl tm-icon-accent-green flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display font-extrabold text-brand-forest lowercase text-sm">{item.label}</p>
                <p className="text-xs text-slate-400">{item.sub}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-grassDeep group-hover:translate-x-0.5 transition" />
            </button>
          ))}
        </div>

        {/* Turfs grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="tm-section-heading">turfs near you</h2>
            <button onClick={goSearch} className="flex items-center gap-1 text-sm font-bold text-brand-grassDeep hover:underline">
              see all <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTurfs.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  icon={Search}
                  title="no turfs for this sport"
                  description={`Try another sport or expand beyond ${app.filterRadius}km.`}
                  actionLabel="search all turfs"
                  onAction={goSearch}
                />
              </div>
            ) : filteredTurfs.map((turf) => {
              const dist = app.getDistance(lat1, lng1, turf.lat, turf.lng).toFixed(1);
              return (
                <article
                  key={turf.id}
                  onClick={() => { app.setActiveTurfId(turf.id); app.setView('turf_details'); }}
                  className="glass-card overflow-hidden !p-0 cursor-pointer group hover:shadow-lg transition"
                >
                  <div className="relative h-48 overflow-hidden">
                    <TurfImage turf={turf} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                    <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-xs font-bold shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {turf.rating}
                    </span>
                    <div className="absolute bottom-3 left-3 flex gap-1">
                      {turf.sports.slice(0, 2).map((sid) => {
                        const s = SPORTS.find((x) => x.id === sid);
                        return s ? (
                          <span key={sid} className="px-2 py-0.5 rounded-full bg-white/95 text-[10px] font-bold text-brand-forest shadow-sm">
                            {s.icon} {s.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <div className="p-4 bg-white/40 backdrop-blur-sm">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-display font-extrabold text-brand-forest lowercase">{turf.name}</h3>
                      <span className="text-xs font-bold text-slate-400 shrink-0">{dist} km</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">{turf.city} · {turf.reviews} reviews</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400">from</span>
                      <span className="font-display font-extrabold text-brand-forest">₹{turf.pricePerHour}/hr</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Players nearby */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-extrabold text-brand-forest lowercase">players near you</h2>
            <button onClick={() => app.setView('play_radius')} className="text-sm font-bold text-brand-grassDeep hover:underline">
              open map →
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto lg:grid lg:grid-cols-6 lg:overflow-visible no-scrollbar pb-1">
            {nearbyPlayers.length === 0 ? (
              <div className="col-span-full w-full">
                <EmptyState
                  icon={User}
                  title="no players nearby"
                  description="Open the map to discover players in your radius."
                  actionLabel="open play radius"
                  onAction={() => app.setView('play_radius')}
                />
              </div>
            ) : nearbyPlayers.map((p) => (
              <div key={p.id} className="glass-card shrink-0 w-32 lg:w-full p-3 text-center hover:shadow-md transition !rounded-2xl">
                <img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-xl mx-auto border border-white/80 object-cover ring-1 ring-brand-grassFresh/20 shadow-sm" />
                <p className="font-bold text-sm text-brand-forest mt-2 truncate">{p.name.split(' ')[0]}</p>
                <p className="text-[11px] text-slate-400">{p.skillLevel}</p>
              </div>
            ))}
          </div>
        </section>
        {openSplits.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-extrabold text-brand-forest lowercase">open split games</h2>
              <button onClick={() => app.setView('locker_room')} className="text-sm font-bold text-brand-grassDeep hover:underline">
                locker room →
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {openSplits.slice(0, 4).map((ann) => {
                const turf = availableTurfs.find(t => t.id === ann.turfId);
                return (
                  <div key={ann.id} className="glass-card p-4 flex items-center gap-3 hover:shadow-md transition !rounded-2xl">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
                      {turf ? (
                        <TurfImage turf={turf} className="w-full h-full object-cover" />
                      ) : (
                        <img src={ann.hostAvatar} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-extrabold text-brand-forest truncate lowercase text-sm">{ann.sportLabel}</p>
                      <p className="text-xs text-slate-400 truncate">{ann.turfName}</p>
                      <p className="text-[11px] font-bold text-brand-grassDeep mt-0.5">{ann.playersNeeded} spots · ₹{ann.costPerHead}/head</p>
                    </div>
                    <button
                      onClick={() => app.joinSplitGame(ann.id)}
                      className="shrink-0 px-4 py-2 tm-btn-primary rounded-full text-xs font-bold"
                    >
                      join
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
