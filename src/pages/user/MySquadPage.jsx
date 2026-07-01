import { useState, useMemo } from 'react';
import { Tag, MessageCircle, Search, Plus, Trophy, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/ui/PageHeader';
import CreateGroupModal from '../../components/squad/CreateGroupModal';
import { LEADERBOARD_METRICS, getFriendIds } from '../../data/leaderboardData';


const SQUADS = [
  { id: 's1', name: 'Sunday Football Crew', memberCount: 12, image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&q=80&w=400' },
  { id: 's2', name: 'Office Cricket Guys', memberCount: 8, image: 'https://images.unsplash.com/photo-1531418847159-148fabe46680?auto=format&fit=crop&q=80&w=400' },
];

export default function MySquadPage() {
  const app = useApp();
  const [activeTab, setActiveTab] = useState('friends');
  const [rankSport, setRankSport] = useState('football');
  const [query, setQuery] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);

  const friends = [];
  const filteredFriends = friends.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));

  const metric = LEADERBOARD_METRICS[rankSport];
  const friendIds = getFriendIds();
  const ranked = useMemo(() =>
    (app.friendStats || [])
      .filter((p) => friendIds.includes(p.id))
      .map((p) => ({ ...p, value: p.stats[rankSport]?.[metric.primary.key] ?? 0 }))
      .sort((a, b) => b.value - a.value),
  [app.friendStats, rankSport, friendIds, metric.primary.key]);

  return (
    <div className="pb-4">
      <PageHeader title="my squad" subtitle="friends, groups & rankings" onBack={() => app.setView('home')} badge="roster" icon={Tag} />

      <div className="flex bg-slate-100/80 p-1 rounded-xl mb-5 border border-slate-200">
        {['friends', 'squads', 'rankings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition capitalize flex items-center justify-center gap-1 ${
              activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
            }`}
          >
            {tab === 'rankings' && <Trophy className="w-3 h-3" />}
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'friends' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search friends..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-grassFresh"
            />
          </div>
          <div className="glass-card divide-y divide-slate-100 overflow-hidden !p-0">
            {filteredFriends.map((friend) => (
              <div key={friend.id} className="p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={friend.avatar} alt="" className="w-11 h-11 rounded-2xl border border-slate-200 object-cover" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-800 truncate">{friend.name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{friend.skillLevel} · {friend.distance}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => app.setView('leaderboard')}
                    className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg"
                    title="Rankings"
                  >
                    <Tag className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { app.setActiveChatId('chat-friend-1'); app.setView('chat'); }}
                    className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'squads' && (
        <div className="space-y-4">
          <button
            onClick={() => setShowGroupModal(true)}
            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50"
          >
            <Plus className="w-4 h-4" /> create squad group
          </button>
          {(app.squadGroups?.length ? app.squadGroups : SQUADS).map((squad) => (
            <button
              key={squad.id}
              onClick={() => app.setView('locker_room')}
              className="w-full glass-card overflow-hidden text-left hover:shadow-md transition flex !p-0"
            >
              <img src={squad.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${squad.id}`} alt="" className="w-24 object-cover shrink-0" />
              <div className="p-4 flex items-center justify-between flex-1 min-w-0">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">{squad.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                    {(squad.members?.length ?? squad.memberCount)} members
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}

      {activeTab === 'rankings' && (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {['football', 'cricket', 'basketball'].map((sid) => (
              <button
                key={sid}
                onClick={() => setRankSport(sid)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border ${
                  rankSport === sid ? 'tm-chip-green' : 'tm-chip-neutral'
                }`}
              >
                {LEADERBOARD_METRICS[sid].icon} {LEADERBOARD_METRICS[sid].label}
              </button>
            ))}
          </div>
          <div className="glass-card divide-y divide-slate-100 overflow-hidden !p-0">
            {ranked.map((p, i) => (
              <div key={p.id} className={`px-4 py-3 flex items-center gap-3 ${p.isMe ? 'tm-row-me' : ''}`}>
                <span className="w-6 font-black text-sm text-slate-400 text-center">{i + 1}</span>
                <img src={p.avatar} alt="" className="w-9 h-9 rounded-xl object-cover" />
                <p className="flex-1 font-bold text-sm text-slate-800 truncate">{p.isMe ? 'you' : p.name.split(' ')[0]}</p>
                <p className="font-display font-extrabold text-slate-800">{p.value}</p>
              </div>
            ))}
          </div>
          <button onClick={() => app.setView('leaderboard')} className="w-full py-3 rounded-2xl tm-btn-primary font-bold text-sm">
            full leaderboard →
          </button>
        </div>
      )}

      <CreateGroupModal open={showGroupModal} onClose={() => setShowGroupModal(false)} />
    </div>
  );
}
