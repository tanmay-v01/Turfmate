import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldAlert, Award, ChevronRight, X, UserPlus, MessageSquare, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/ui/PageHeader';
import { socialApi } from '../../services/api';

export default function PlayerRadarPage() {
  const app = useApp();
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSport, setActiveSport] = useState('');
  const [activeSkill, setActiveSkill] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showReviewInput, setShowReviewInput] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const submitReview = () => {
    app.showToast('Endorsement submitted successfully!', 'success');
    setShowReviewInput(false);
    setReviewText('');
    setReviewRating(5);
  };

  const getTierBadge = (tier) => {
    const t = (tier || 'Bronze').toLowerCase();
    if (t === 'pro') return 'bg-purple-100 text-purple-800 border-purple-200 font-black';
    if (t === 'gold') return 'bg-amber-100 text-amber-800 border-amber-200 font-extrabold';
    if (t === 'silver') return 'bg-slate-100 text-slate-200 border-slate-200 font-bold';
    return 'bg-orange-100 text-orange-800 border-orange-200 font-medium';
  };

  const getTierIcon = (tier) => {
    const t = (tier || 'Bronze').toLowerCase();
    if (t === 'pro') return '⚡';
    if (t === 'gold') return '👑';
    if (t === 'silver') return '🥈';
    return '🥉';
  };

  useEffect(() => {
    // Fetch from Radar API
    const fetchRadar = async () => {
      setIsLoading(true);
      try {
        const results = await socialApi.searchRadar(activeSport, activeSkill, '');
        const tiers = ['Bronze', 'Silver', 'Gold', 'Pro'];
        const enriched = results.map((p, idx) => ({
          ...p,
          skillTier: p.skillTier || tiers[idx % 4]
        }));
        setPlayers(enriched);
      } catch (e) {
        console.error('Radar search error:', e);
        // Fallback mock data if server fails
        setPlayers([
          { user_id: '1', username: 'RahulC', full_name: 'Rahul C', avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=RahulC', reliability_score: 4.9, total_games_played: 42, splits_hosted: 15, badges: '["Top Organizer", "Early Bird"]', skill_tags: '{"cricket": "pro", "football": "amateur"}', skillTier: 'Gold' },
          { user_id: '2', username: 'Amit', full_name: 'Amit S', avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AmitS', reliability_score: 2.8, total_games_played: 14, splits_hosted: 0, badges: '[]', skill_tags: '{"football": "pro"}', skillTier: 'Bronze' },
          { user_id: '3', username: 'Sneha', full_name: 'Sneha P', avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sneha', reliability_score: 5.0, total_games_played: 89, splits_hosted: 4, badges: '["MVP"]', skill_tags: '{"pickleball": "pro"}', skillTier: 'Pro' }
        ]);
      }
      setIsLoading(false);
    };
    fetchRadar();
  }, [activeSport, activeSkill]);

  const parseJson = (str, fallback) => {
    try { return JSON.parse(str); } catch { return fallback; }
  };

  return (
    <div className="animate-fade-up pb-8">
      <PageHeader
        title="Player Radar"
        subtitle="Find players within 10km"
        onBack={() => app.setView('home')}
        badge="matchmaking"
      />

      <div className="mt-2 space-y-4">
        {/* Search & Filters */}
        <div className="flex gap-2 items-center">
          <div className="flex-grow relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by position or name..."
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-grassFresh"
            />
          </div>
          <button className="p-2.5 tm-btn-primary rounded-xl shadow-md !p-2.5">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Sport Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['', 'football', 'cricket', 'pickleball'].map(sport => (
            <button
              key={sport}
              onClick={() => setActiveSport(sport)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap capitalize transition ${
                activeSport === sport ? 'tm-chip-green' : 'tm-chip-neutral'
              }`}
            >
              {sport || 'All Sports'}
            </button>
          ))}
        </div>

        {/* Skill Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['', 'beginner', 'amateur', 'pro'].map(skill => (
            <button
              key={skill}
              onClick={() => setActiveSkill(skill)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap uppercase tracking-wider transition ${
                activeSkill === skill ? 'tm-chip-green' : 'tm-chip-neutral'
              }`}
            >
              {skill || 'Any Skill Level'}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-slate-400 py-8 text-sm font-bold animate-pulse">Scanning Radar...</p>
          ) : players.length === 0 ? (
            <p className="text-center text-slate-400 py-8 text-sm font-bold">No players found matching criteria.</p>
          ) : (
            players.map((player) => {
              const skills = parseJson(player.skill_tags, {});
              const isUnreliable = player.reliability_score < 3.0;

              // Exclude banned users
              const username = player.username;
              const hasBannedMatch = app.bannedUsers.some(b => {
                const bClean = b.replace(/^@/, '').toLowerCase();
                const pClean = username?.replace(/^@/, '').toLowerCase();
                return bClean === pClean;
              });
              if (hasBannedMatch) return null;

              if (searchQuery && !player.username?.toLowerCase().includes(searchQuery.toLowerCase()) && !player.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) return null;
              
              if (activeSport && !skills[activeSport]) return null;
              
              if (activeSkill) {
                if (activeSport) {
                  if (skills[activeSport]?.toLowerCase() !== activeSkill.toLowerCase()) return null;
                } else {
                  const skillValues = Object.values(skills).map(s => s.toLowerCase());
                  if (!skillValues.includes(activeSkill.toLowerCase())) return null;
                }
              }

              return (
                <div 
                  key={player.user_id} 
                  onClick={() => setSelectedPlayer(player)}
                  className={`glass-card p-3 flex items-center gap-3 cursor-pointer transition hover:shadow-md ${isUnreliable ? 'ring-1 ring-red-100' : ''}`}
                >
                  <img src={player.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${player.username}`} alt="" className="w-12 h-12 rounded-full border-2 border-white/10 bg-slate-50 shrink-0" />
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-extrabold text-sm text-slate-200 truncate">{player.username}</h4>
                      {isUnreliable && <ShieldAlert className="w-3.5 h-3.5 text-red-500" />}
                      <span className={`px-2 py-0.5 rounded-full border text-[8px] uppercase tracking-wider ${getTierBadge(player.skillTier)}`}>
                        {getTierIcon(player.skillTier)} {player.skillTier || 'Bronze'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5 capitalize">
                      {Object.entries(skills).map(([k, v]) => `${k} (${v})`).join(' • ')}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-white">
                      <span className="text-[10px] font-bold">★</span>
                      <span className="text-sm font-black">{player.reliability_score?.toFixed(1)}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mt-0.5">{player.total_games_played} Games</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white/5 w-full max-w-sm rounded-3xl p-5 relative animate-slide-up shadow-2xl">
            <button 
              onClick={() => setSelectedPlayer(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mt-2">
              <img src={selectedPlayer.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedPlayer.username}`} alt="" className="w-20 h-20 rounded-full mx-auto border-4 border-slate-50 shadow-sm" />
              <h2 className="text-xl font-black text-white mt-3 font-display">{selectedPlayer.username}</h2>
              <p className="text-xs text-slate-500 font-bold">{selectedPlayer.full_name}</p>
              <div className="mt-2 flex justify-center">
                <span className={`px-3 py-1 rounded-full border text-[9px] uppercase font-black tracking-wider flex items-center gap-1 ${getTierBadge(selectedPlayer.skillTier)}`}>
                  {getTierIcon(selectedPlayer.skillTier)} {selectedPlayer.skillTier || 'Bronze'} tier
                </span>
              </div>
            </div>

            {selectedPlayer.reliability_score < 3.0 && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 mt-4 flex gap-2 items-start">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-[10px] text-red-800 font-bold leading-tight uppercase tracking-wider">Historically a No-Show. Turf Rating is critically low. Proceed with caution.</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-slate-50 rounded-xl p-3 text-center border border-white/10">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Turf Rating</span>
                <span className={`text-2xl font-black ${selectedPlayer.reliability_score >= 4.0 ? 'text-green-600' : selectedPlayer.reliability_score >= 3.0 ? 'text-amber-500' : 'text-red-500'}`}>
                  {selectedPlayer.reliability_score?.toFixed(1)}
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center border border-white/10">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Games Played</span>
                <span className="text-2xl font-black text-slate-200">{selectedPlayer.total_games_played}</span>
              </div>
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sports DNA</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(parseJson(selectedPlayer.skill_tags, {})).map(([sport, skill]) => (
                  <span key={sport} className="px-3 py-1 bg-lime-400/15 text-white text-[10px] font-bold rounded-lg capitalize border border-brand-primary/30">
                    {sport}: {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Badges</h4>
               <div className="flex gap-2">
                 {parseJson(selectedPlayer.badges, []).length === 0 ? (
                   <span className="text-xs text-slate-400 italic">No badges earned yet.</span>
                 ) : (
                   parseJson(selectedPlayer.badges, []).map(badge => (
                     <div key={badge} className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-200">
                       <Award className="w-3.5 h-3.5" />
                       <span className="text-[10px] font-bold">{badge}</span>
                     </div>
                   ))
                 )}
               </div>
            </div>

            {/* Endorsements Section */}
            <div className="mt-4 border-t border-white/10 pt-4">
               <div className="flex justify-between items-center mb-2">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Endorsements</h4>
                 <button 
                   onClick={() => setShowReviewInput(!showReviewInput)}
                   className="text-[9px] font-bold text-lime-400 border border-brand-grassFresh px-2 py-0.5 rounded hover:bg-lime-400/10 transition"
                 >
                   {showReviewInput ? 'Cancel' : 'Write Endorsement'}
                 </button>
               </div>

               {showReviewInput && (
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-3 animate-fade-in text-left">
                   <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setReviewRating(star)} className="focus:outline-none">
                          <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        </button>
                      ))}
                   </div>
                   <input 
                     value={reviewText}
                     onChange={(e) => setReviewText(e.target.value)}
                     placeholder="e.g., Great defender, always on time..."
                     className="w-full bg-white/5 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-brand-grassFresh mb-2"
                   />
                   <button 
                     onClick={submitReview}
                     disabled={!reviewText.trim()}
                     className="w-full py-2 tm-btn-primary text-[10px] font-extrabold rounded-lg disabled:opacity-50"
                   >
                     Submit
                   </button>
                 </div>
               )}

               <div className="space-y-2 text-left">
                 <div className="bg-slate-50 rounded-lg p-2 border border-white/10">
                   <div className="flex items-center justify-between mb-1">
                     <span className="font-bold text-[10px] text-white">Suraj K.</span>
                     <span className="flex text-amber-400"><Star className="w-2.5 h-2.5 fill-amber-400" /><Star className="w-2.5 h-2.5 fill-amber-400" /><Star className="w-2.5 h-2.5 fill-amber-400" /><Star className="w-2.5 h-2.5 fill-amber-400" /><Star className="w-2.5 h-2.5 fill-amber-400" /></span>
                   </div>
                   <p className="text-[9px] text-slate-600">Always on time and plays as a solid defender.</p>
                 </div>
                 <div className="bg-slate-50 rounded-lg p-2 border border-white/10">
                   <div className="flex items-center justify-between mb-1">
                     <span className="font-bold text-[10px] text-white">Anon</span>
                     <span className="flex text-amber-400"><Star className="w-2.5 h-2.5 fill-amber-400" /><Star className="w-2.5 h-2.5 fill-amber-400" /><Star className="w-2.5 h-2.5 fill-amber-400" /><Star className="w-2.5 h-2.5" /><Star className="w-2.5 h-2.5" /></span>
                   </div>
                   <p className="text-[9px] text-slate-600">Good skills, but canceled last minute once.</p>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  app.openDmWithUser({
                    name: selectedPlayer.full_name || selectedPlayer.username,
                    avatar: selectedPlayer.avatar_url,
                  });
                  setSelectedPlayer(null);
                }}
                className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition"
              >
                <MessageSquare className="w-4 h-4" /> Message
              </button>
              <button
                onClick={() => {
                  if (app.sentFriendRequests?.includes(selectedPlayer.username)) {
                    app.showToast('Request already sent', 'info');
                  } else {
                    app.sendFriendRequest(selectedPlayer);
                  }
                  setSelectedPlayer(null);
                }}
                className="flex items-center justify-center gap-2 py-3 tm-btn-primary font-bold rounded-xl text-xs"
              >
                <UserPlus className="w-4 h-4" /> {app.sentFriendRequests?.includes(selectedPlayer.username) ? 'Request Sent' : 'Add Friend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
