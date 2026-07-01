import { useState, useMemo } from 'react';
import { Plus, Check, ArrowRight, Megaphone, X, MessageSquare, MapPin, Trophy, Heart, Flame, Camera, CircleDot, Wallet } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/ui/PageHeader';
import TurfImage from '../../components/ui/TurfImage';

export default function LockerRoomPage() {
  const app = useApp();
  const [activeFilter, setActiveFilter] = useState('trending');
  const [showPostModal, setShowPostModal] = useState(false);
  const [postText, setPostText] = useState('');
  const [postCategory, setPostCategory] = useState('LFG');
  
  // Highlight fields
  const [highlightSport, setHighlightSport] = useState('football');
  const [teamA, setTeamA] = useState('');
  const [scoreA, setScoreA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [scoreB, setScoreB] = useState('');

  const [claps, setClaps] = useState({});

  const handleClap = (id) => {
    setClaps(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const lat = app.userProfile.lat || 19.456;
  const lng = app.userProfile.lng || 72.812;

  const [now] = useState(() => Date.now());

  const feed = app.announcements.filter((ann) => {
    const hostName = ann.hostName;
    const hasBannedMatch = app.bannedUsers.some(b => {
      const bClean = b.replace(/^@/, '').toLowerCase();
      const hClean = hostName?.replace(/^@/, '').toLowerCase();
      return bClean === hClean;
    });
    if (hasBannedMatch) return false;

    if (ann.expiresAt && now > ann.expiresAt) return false;
    if (ann.fundingExpiresAt && now > ann.fundingExpiresAt) return false;

    const turf = app.turfs.find((t) => t.id === ann.turfId);
    const dist = turf
      ? app.getDistance(lat, lng, turf.lat, turf.lng)
      : parseFloat(ann.distance) || 1;
    if (dist > app.filterRadius) return false;
    if (activeFilter === 'football' && !ann.sportLabel?.toLowerCase().includes('football') && ann.sport !== 'football') return false;
    if (activeFilter === 'cricket' && !ann.sportLabel?.toLowerCase().includes('cricket') && ann.sport !== 'cricket') return false;
    if (activeFilter === 'pickleball' && !ann.sportLabel?.toLowerCase().includes('pickleball')) return false;
    if (activeFilter === 'splits' && ann.status !== 'open' && ann.playersNeeded <= 0) return false;
    if (activeFilter === 'highlights' && !ann.isHighlight) return false;
    return true;
  });

  const handleCreatePost = () => {
    if (!postText.trim()) return;
    const extra = {};
    if (postCategory === 'HIGHLIGHT') {
      extra.isHighlight = true;
      extra.sport = highlightSport;
      extra.highlightScore = {
        teamAName: teamA.trim() || 'Team A',
        teamAScore: scoreA.trim() || '0',
        teamBName: teamB.trim() || 'Team B',
        teamBScore: scoreB.trim() || '0'
      };
    }
    app.createLockerPost(postCategory, postText.trim(), extra);
    setShowPostModal(false);
    setPostText('');
    setTeamA('');
    setScoreA('');
    setTeamB('');
    setScoreB('');
  };

  const openTurf = (turfId) => {
    if (!turfId) return;
    app.setActiveTurfId(turfId);
    app.setView('turf_details');
  };

  return (
    <div className="animate-fade-up pb-24">
      <PageHeader
        title="locker room"
        subtitle={`${app.userProfile.location || 'Virar'} · ${app.filterRadius}km radius`}
        onBack={() => app.setView('home')}
        badge="live feed"
        icon={Megaphone}
      />

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
        {[
          { key: 'trending', label: 'Trending', icon: Flame },
          { key: 'highlights', label: 'Highlights', icon: Camera },
          { key: 'football', label: 'Football', icon: CircleDot },
          { key: 'cricket', label: 'Cricket', icon: Trophy },
          { key: 'pickleball', label: 'Pickleball', icon: CircleDot },
          { key: 'splits', label: 'Splits', icon: Wallet },
        ].map((f) => {
          const Icon = f.icon;
          return (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`tm-chip shrink-0 ${activeFilter === f.key ? 'tm-chip-active' : ''}`}
          >
            <Icon className="w-3 h-3" />
            {f.label}
          </button>
          );
        })}
      </div>

      <div className="glass-card p-4 mb-5">
        <p className="text-sm font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg tm-icon-accent-amber flex items-center justify-center text-xs">💡</span>
          radius-matched feed
        </p>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Open splits, LFG posts, and turf events from players near you. Join and pay your share instantly.
        </p>
      </div>

      {feed.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-4xl mb-3">🏟️</p>
          <p className="font-bold text-white">Nothing here yet</p>
          <p className="text-sm text-slate-400 mt-1">Try another filter or post something.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feed.map((ann, i) => {
            const isMember = ann.roster?.includes(app.userProfile.name);
            return (
              <article
                key={ann.id}
                className={`glass-card !rounded-[24px] overflow-hidden transition animate-fade-up !p-0 ${
                  (ann.contentType === 'PROMO' || ann.isPromo || ann.category === 'PROMO')
                    ? 'border-2 border-amber-400 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 shadow-[0_4px_20px_rgba(245,158,11,0.15)] animate-pulse'
                    : ann.isAdminAnnouncement
                    ? 'ring-1 ring-amber-200'
                    : ''
                }`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {(ann.turfImage || app.turfs.find(t => t.id === ann.turfId)) && (
                  <div className="relative h-32">
                    <TurfImage
                      turf={app.turfs.find(t => t.id === ann.turfId)}
                      src={ann.turfImage}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute bottom-2 left-3 px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-bold text-white">
                      {ann.sportIcon} {ann.sportLabel}
                    </span>
                  </div>
                )}
                <div className="p-5">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={ann.hostAvatar} alt="" className="w-12 h-12 rounded-2xl border-2 border-brand-grassLight/50 object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-extrabold text-white text-sm">{ann.hostName}</span>
                        {ann.isAdminAnnouncement ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[10px] font-bold text-amber-800">owner</span>
                        ) : ann.hostLevel ? (
                          <span className="tm-info-chip !py-0.5 !px-2 text-[10px]">{ann.hostLevel}</span>
                        ) : null}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{ann.distance} · {ann.time}</p>
                    </div>
                  </div>
                  <span className="text-2xl shrink-0">{ann.sportIcon}</span>
                </div>

                {ann.isHighlight && ann.highlightScore && (
                  <div className="mt-4 bg-gradient-to-r from-brand-forest to-brand-grassDeep text-white rounded-2xl p-4 shadow-inner relative overflow-hidden">
                    <div className="absolute right-2 top-2 opacity-15">
                      <Trophy className="w-16 h-16 text-white" />
                    </div>
                    <div className="text-center mb-1">
                      <span className="text-[8px] font-black uppercase bg-white/20 text-white px-2 py-0.5 rounded-full tracking-wider">
                        {ann.sport === 'cricket' ? '🏏 Box Cricket Result' : '⚽ Football Result'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 py-1.5">
                      <div className="text-center flex-1 min-w-0">
                        <p className="text-[11px] font-black truncate">{ann.highlightScore.teamAName || 'Team A'}</p>
                        <p className="text-lg font-black mt-0.5">{ann.highlightScore.teamAScore}</p>
                      </div>
                      <span className="text-[10px] font-black text-green-300">vs</span>
                      <div className="text-center flex-1 min-w-0">
                        <p className="text-[11px] font-black truncate">{ann.highlightScore.teamBName || 'Team B'}</p>
                        <p className="text-lg font-black mt-0.5">{ann.highlightScore.teamBScore}</p>
                      </div>
                    </div>
                  </div>
                )}

                {ann.text && (
                  <p className="mt-4 text-sm text-slate-600 bg-slate-50 rounded-2xl p-3 border border-white/10 leading-relaxed">
                    {ann.text}
                  </p>
                )}

                {ann.turfName && (
                  <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="glass-card !rounded-2xl p-3 !shadow-none">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">venue</p>
                      <p className="font-bold text-white mt-0.5 truncate">{ann.sportLabel} @ {ann.turfName}</p>
                    </div>
                    <div className="glass-card !rounded-2xl p-3 !shadow-none">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">squad</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ann.roster?.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">be the first!</span>
                        ) : (
                          ann.roster.map((name) => (
                            <span key={name} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-slate-200">
                              {name === app.userProfile.name ? 'you' : name.split(' ')[0]}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pb-1">
                  <button
                    onClick={() => handleClap(ann.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-500 text-xs font-bold transition"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current text-rose-400" />
                    <span>{(claps[ann.id] || 0) + (ann.isHighlight ? 12 : 3)} claps</span>
                  </button>
                  {ann.isHighlight && (
                    <span className="tm-info-chip !py-0.5 !px-2 text-[9px] uppercase tracking-wider">
                      Match Record
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                  {ann.isAdminAnnouncement ? (
                    <>
                      <p className="text-xs font-bold text-amber-700">Venue offer</p>
                      <button
                        onClick={() => openTurf(ann.turfId)}
                        className="px-5 py-2 bg-amber-500 text-white rounded-full text-xs font-bold hover:bg-amber-600 transition"
                      >
                        book now
                      </button>
                    </>
                  ) : ann.status === 'lfg' ? (
                    <>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">looking for team</p>
                      <button
                        onClick={() => app.openDmWithUser({ name: ann.hostName, avatar: ann.hostAvatar })}
                        className="px-5 py-2 bg-slate-100 text-slate-700 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200 transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> message
                      </button>
                    </>
                  ) : ann.playersNeeded > 0 ? (
                    <>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">split cost</p>
                        <p className="font-display font-extrabold text-white">₹{ann.costPerHead}/head</p>
                      </div>
                      {ann.status === 'filled' ? (
                        <span className="px-4 py-2 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">filled</span>
                      ) : isMember ? (
                        <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full tm-tint-green text-xs font-bold border">
                          <Check className="w-4 h-4" /> joined
                        </span>
                      ) : (
                        <button
                          onClick={() => app.joinSplitGame(ann.id)}
                          className="inline-flex items-center gap-1 px-5 py-2.5 tm-btn-primary rounded-full text-sm font-bold"
                        >
                          pay ₹{ann.costPerHead} & join <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {ann.turfName}</p>
                      <button onClick={() => openTurf(ann.turfId)} className="text-xs font-bold text-lime-400 hover:underline">
                        view turf →
                      </button>
                    </>
                  )}
                </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setShowPostModal(true)}
        className="fixed bottom-24 right-4 w-14 h-14 tm-btn-primary rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition z-40"
      >
        <Megaphone className="w-6 h-6" />
      </button>

      {showPostModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-end sm:items-center z-50">
          <div className="bg-white/5 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 pb-8 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-extrabold text-white">create post</h3>
              <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

             <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {['LFG', 'GENERAL', 'SELLING GEAR', 'HIGHLIGHT'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPostCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                      postCategory === cat
                        ? 'tm-chip-green'
                        : 'tm-chip-neutral'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {postCategory === 'HIGHLIGHT' && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Select Sport</span>
                    <div className="flex gap-2">
                      {['football', 'cricket'].map(sp => (
                        <button
                          key={sp}
                          type="button"
                          onClick={() => setHighlightSport(sp)}
                          className={`px-2 py-1 rounded text-[9px] font-black uppercase transition ${
                            highlightSport === sp ? 'tm-chip-green' : 'tm-chip-neutral'
                          }`}
                        >
                          {sp}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Team A Name"
                        value={teamA}
                        onChange={(e) => setTeamA(e.target.value)}
                        className="w-full bg-white/5 border border-slate-200 rounded-xl p-2 text-xs focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Team A Score"
                        value={scoreA}
                        onChange={(e) => setScoreA(e.target.value)}
                        className="w-full bg-white/5 border border-slate-200 rounded-xl p-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Team B Name"
                        value={teamB}
                        onChange={(e) => setTeamB(e.target.value)}
                        className="w-full bg-white/5 border border-slate-200 rounded-xl p-2 text-xs focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Team B Score"
                        value={scoreB}
                        onChange={(e) => setScoreB(e.target.value)}
                        className="w-full bg-white/5 border border-slate-200 rounded-xl p-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder={postCategory === 'HIGHLIGHT' ? "Describe the highlight (e.g. Rahul scored a hat-trick!)" : "What's happening in your local sports scene?"}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-brand-grassFresh resize-none h-28"
                maxLength={300}
              />

              <button
                onClick={handleCreatePost}
                disabled={!postText.trim() || (postCategory === 'HIGHLIGHT' && (!teamA.trim() || !teamB.trim() || !scoreA.trim() || !scoreB.trim()))}
                className="w-full py-3.5 tm-btn-primary rounded-2xl font-bold text-sm disabled:opacity-50"
              >
                broadcast to locker room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
