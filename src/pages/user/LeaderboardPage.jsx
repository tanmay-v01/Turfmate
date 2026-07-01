import { useState, useMemo, useEffect } from 'react';
import { Trophy, Medal, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/ui/PageHeader';
import { LEADERBOARD_METRICS, getFriendIds } from '../../data/leaderboardData';


const RANK_STYLES = [
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-slate-100 text-slate-600 border-slate-200',
  'bg-orange-50 text-orange-700 border-orange-200',
];

const MOCK_PLAYERS = [];

export default function LeaderboardPage() {
  const app = useApp();
  const sports = Object.keys(LEADERBOARD_METRICS);
  const [sport, setSport] = useState(app.userProfile.favoriteSports?.[0] || 'football');
  const [scope, setScope] = useState('squad'); // squad or virar

  useEffect(() => {
    if (app.userProfile?.isLoggedIn && app.refreshLeaderboard) {
      app.refreshLeaderboard(scope === 'virar' ? 'area' : 'squad');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, app.userProfile?.isLoggedIn, app.refreshLeaderboard]);

  const metric = LEADERBOARD_METRICS[sport];
  const friendIds = getFriendIds();

  const ranked = useMemo(() => {
    let list = app.friendStats;
    if (scope === 'squad') {
      list = list.filter((p) => friendIds.includes(p.id));
    } else {
      list = list.filter((p) => {
        if (p.isMe) return true;
        const mp = MOCK_PLAYERS.find(x => x.id === p.id);
        const pLat = mp?.lat || 19.456;
        const pLng = mp?.lng || 72.812;
        const dist = app.getDistance(app.userProfile.lat, app.userProfile.lng, pLat, pLng);
        return dist <= app.filterRadius;
      });
    }
    const entries = list
      .map((p) => ({
        ...p,
        value: p.stats[sport]?.[metric.primary.key] ?? 0,
      }))
      .sort((a, b) => b.value - a.value);
    return entries;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.friendStats, scope, sport, friendIds, metric.primary.key, app.filterRadius, app.userProfile.lat, app.userProfile.lng]);

  const myRank = ranked.findIndex((p) => p.isMe) + 1;
  const myEntry = ranked.find((p) => p.isMe);

  return (
    <div className="animate-fade-up pb-32">
      <PageHeader
        title="squad leaderboard"
        subtitle="friends ranked by sport stats"
        onBack={() => app.setView('home')}
        badge="rankings"
        icon={Trophy}
      />

      <div className="space-y-5">
        <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl w-full border border-slate-200">
          <button
            onClick={() => setScope('squad')}
            className={`flex-1 py-2 text-center text-xs font-black uppercase rounded-xl transition-all ${
              scope === 'squad'
                ? 'bg-white text-brand-forest shadow-sm'
                : 'text-slate-500 hover:text-brand-forest'
            }`}
          >
            👥 My Squad
          </button>
          <button
            onClick={() => setScope('virar')}
            className={`flex-1 py-2 text-center text-xs font-black uppercase rounded-xl transition-all ${
              scope === 'virar'
                ? 'bg-white text-brand-forest shadow-sm'
                : 'text-slate-500 hover:text-brand-forest'
            }`}
          >
            📍 {app.userProfile.location || 'Virar'} ({app.filterRadius}km)
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {sports.map((sid) => {
            const m = LEADERBOARD_METRICS[sid];
            return (
              <button
                key={sid}
                onClick={() => setSport(sid)}
                className={`tm-chip shrink-0 ${sport === sid ? 'tm-chip-active' : ''}`}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        {myEntry && (
          <div className="glass-card tm-card-color tm-stripe-amber p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl tm-icon-accent-amber flex items-center justify-center">
              <Trophy className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">your rank</p>
              <p className="text-2xl font-display font-extrabold text-brand-forest">
                #{myRank || '—'} <span className="text-base font-bold text-slate-400">of {ranked.length}</span>
              </p>
              <p className="text-sm text-slate-500">
                {myEntry.value} {metric.primary.label} in {metric.label.toLowerCase()}
              </p>
            </div>
            <button
              onClick={() => app.setView('score_calculator')}
              className="shrink-0 px-4 py-2 tm-btn-primary rounded-full text-xs font-bold"
            >
              log game
            </button>
          </div>
        )}

        {/* Podium top 3 */}
        {ranked.length >= 3 && (
          <div className="grid grid-cols-3 gap-2 items-end">
            {[1, 0, 2].map((rankIdx, podiumIdx) => {
              const p = ranked[rankIdx];
              if (!p) return null;
              const heights = ['h-28', 'h-36', 'h-24'];
              return (
                <div key={p.id} className={`${heights[podiumIdx]} flex flex-col justify-end`}>
                  <div className="text-center mb-2">
                    <img src={p.avatar} alt="" className="w-10 h-10 rounded-2xl mx-auto border-2 border-white shadow-md object-cover" />
                    <p className="text-xs font-bold text-brand-forest mt-1 truncate px-1">{p.isMe ? 'you' : p.name.split(' ')[0]}</p>
                    <p className="text-lg font-display font-extrabold text-brand-forest">{p.value}</p>
                  </div>
                  <div className={`rounded-t-2xl flex items-center justify-center font-black text-sm border ${RANK_STYLES[podiumIdx]}`}>
                    #{rankIdx + 1}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full list */}
        <div className="glass-card divide-y divide-slate-100 overflow-hidden !p-0">
          <div className="px-4 py-3 flex items-center justify-between bg-slate-50/80">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">all friends</span>
            <span className="text-[10px] font-bold text-brand-grassDeep flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> by {metric.primary.label}
            </span>
          </div>

          {ranked.map((p, i) => (
            <div
              key={p.id}
              className={`px-4 py-3.5 flex items-center gap-3 ${p.isMe ? 'tm-row-me' : ''}`}
            >
              <span className={`w-7 text-center font-black text-sm ${i < 3 ? 'text-brand-grassDeep' : 'text-slate-300'}`}>
                {i < 3 ? <Medal className="w-5 h-5 mx-auto" /> : i + 1}
              </span>
              <img src={p.avatar} alt="" className="w-10 h-10 rounded-2xl border border-slate-100 object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-brand-forest truncate">
                  {p.isMe ? `${p.name} (you)` : p.name}
                </p>
                <div className="flex gap-3 mt-0.5">
                  {metric.secondary.slice(0, 2).map((s) => (
                    <span key={s.key} className="text-[10px] text-slate-400 font-medium">
                      {p.stats[sport]?.[s.key] ?? 0} {s.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-display font-extrabold text-brand-forest">{p.value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{metric.primary.label}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-slate-400 px-4">
          finish a match in the score calculator to auto-update your stats
        </p>

        {myEntry && (
          <div className="fixed bottom-[140px] left-4 right-4 z-30 lg:left-[264px] lg:bottom-4 lg:right-4 bg-brand-forest text-white rounded-2xl p-3.5 shadow-premium flex items-center justify-between animate-slide-up border border-brand-grassFresh/20">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-primary text-brand-forest font-black text-xs flex items-center justify-center">
                #{myRank || '—'}
              </span>
              <img src={myEntry.avatar} alt="" className="w-8 h-8 rounded-xl object-cover ring-2 ring-white/20" />
              <div>
                <p className="text-xs font-black">
                  {myEntry.name} <span className="text-[10px] text-brand-primary font-bold">(you)</span>
                </p>
                <p className="text-[10px] text-white/70 flex gap-2">
                  <span>{myEntry.value} {metric.primary.label}</span>
                  {metric.secondary.slice(0, 1).map((s) => (
                    <span key={s.key} className="text-white/50">
                      • {myEntry.stats[sport]?.[s.key] ?? 0} {s.label}
                    </span>
                  ))}
                </p>
              </div>
            </div>
            <button
              onClick={() => app.setView('score_calculator')}
              className="px-3.5 py-1.5 bg-brand-primary text-brand-forest rounded-full text-[10px] font-black uppercase hover:scale-105 active:scale-95 transition"
            >
              log game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
