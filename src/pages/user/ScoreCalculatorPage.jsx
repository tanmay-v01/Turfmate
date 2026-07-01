import { useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, Timer, Trophy, Share2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/ui/PageHeader';
import CricketScorer, { CricketUndoButton } from '../../components/score/CricketScorer';
import FootballScorer from '../../components/score/FootballScorer';
import { useGameTimer } from '../../hooks/useGameTimer';
import { createCricketGame, createFootballGame, formatTimer } from '../../utils/scoreEngine';
import { SPORTS } from '../../constants/sports';

const SCORER_SPORTS = ['football', 'cricket'];

export default function ScoreCalculatorPage() {
  const app = useApp();
  const [sport, setSport] = useState('football');
  const [teamA, setTeamA] = useState('Blue FC');
  const [teamB, setTeamB] = useState('Red FC');
  const [history, setHistory] = useState([]);
  const [finishedGame, setFinishedGame] = useState(null);
  const [highlightCaption, setHighlightCaption] = useState('');
  const [mvpIdx, setMvpIdx] = useState(0);
  const [allocations, setAllocations] = useState({});
  const squadPlayers = app.friendStats || [];

  const liveGame = app.liveGame;
  const setGame = app.setLiveGame;

  const { toggle: toggleTimer, reset: resetTimer } = useGameTimer(liveGame, setGame);

  const startGame = () => {
    const game = sport === 'cricket'
      ? createCricketGame({ teamA, teamB, maxOvers: 10 })
      : createFootballGame({ teamA, teamB, halfMins: 20 });
    setHistory([game]);
    setGame(game);
  };

  const onHistoryPush = useCallback((next) => {
    setHistory((h) => [...h, next]);
  }, []);

  const undo = () => {
    if (history.length <= 1) return;
    const prev = history[history.length - 2];
    setHistory((h) => h.slice(0, -1));
    setGame(prev);
  };

  const endGame = () => {
    if (!liveGame) return;
    const finished = { ...liveGame, status: 'completed', timerRunning: false };
    app.finalizeLiveGame(finished);
    setHistory([]);
    setGame(null);
    setFinishedGame(finished);
  };

  const handleShareHighlight = () => {
    if (!finishedGame) return;
    
    const isCricket = finishedGame.sport === 'cricket';
    const scoreA = isCricket 
      ? `${finishedGame.teamA.runs}/${finishedGame.teamA.wickets} (${finishedGame.teamA.overs || 0} ov)` 
      : `${finishedGame.teamA.goals}`;
    const scoreB = isCricket 
      ? `${finishedGame.teamB.runs}/${finishedGame.teamB.wickets} (${finishedGame.teamB.overs || 0} ov)` 
      : `${finishedGame.teamB.goals}`;

    const mvpPlayerName = squadPlayers[mvpIdx]?.name || 'Rahul Mehta';
    const allocString = Object.entries(allocations)
      .filter(([_, val]) => val > 0)
      .map(([id, val]) => `${squadPlayers.find(p => p.id === id)?.name.split(' ')[0]}: ${val} ${isCricket ? 'runs' : 'goals'}`)
      .join(', ');

    const extraText = `\n🏆 MVP: ${mvpPlayerName}${allocString ? `\n📊 Stats: ${allocString}` : ''}`;

    const extra = {
      isHighlight: true,
      sport: finishedGame.sport,
      highlightScore: {
        teamAName: finishedGame.teamA.name || 'Team A',
        teamAScore: scoreA,
        teamBName: finishedGame.teamB.name || 'Team B',
        teamBScore: scoreB
      },
      turfName: 'Green Valley Arena'
    };

    app.createLockerPost(
      'HIGHLIGHT', 
      (highlightCaption.trim() || `Amazing ${finishedGame.sport} match completed! What a game!`) + extraText, 
      extra
    );

    setFinishedGame(null);
    setHighlightCaption('');
    setAllocations({});
    app.setView('locker_room');
  };

  const discard = () => {
    setHistory([]);
    setGame(null);
  };

  const sportMeta = SPORTS.find((s) => s.id === sport);

  if (finishedGame) {
    const isCricket = finishedGame.sport === 'cricket';
    return (
      <div className="animate-fade-up pb-8">
        <PageHeader
          title="match summary"
          subtitle="congratulations on finishing your game!"
          onBack={() => setFinishedGame(null)}
          badge="concluded"
        />

        <div className="space-y-6 mt-4">
          <div className="glass-card p-6 space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 tm-icon-accent-amber rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="font-display font-extrabold text-brand-forest text-lg lowercase">match recorded successfully</h3>
              <p className="text-xs text-slate-400">your stats have been synced to the squad leaderboard</p>
            </div>

            {/* Scorecard Preview */}
            <div className="bg-gradient-to-r from-brand-forest to-brand-grassDeep text-white rounded-2xl p-5 text-center relative overflow-hidden shadow-md">
              <span className="text-[9px] font-black uppercase bg-white/25 px-2.5 py-0.5 rounded-full tracking-wider">
                {isCricket ? '🏏 Cricket scorecard' : '⚽ Football scorecard'}
              </span>
              
              <div className="flex justify-between items-center gap-4 mt-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black truncate">{finishedGame.teamA.name}</p>
                  <p className="text-2xl font-black mt-1">
                    {isCricket ? `${finishedGame.teamA.runs}/${finishedGame.teamA.wickets}` : finishedGame.teamA.goals}
                  </p>
                  {isCricket && <p className="text-[10px] text-slate-300 font-bold">{finishedGame.teamA.overs || 0} overs</p>}
                </div>

                <span className="text-xs font-bold text-green-300">vs</span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black truncate">{finishedGame.teamB.name}</p>
                  <p className="text-2xl font-black mt-1">
                    {isCricket ? `${finishedGame.teamB.runs}/${finishedGame.teamB.wickets}` : finishedGame.teamB.goals}
                  </p>
                  {isCricket && <p className="text-[10px] text-slate-300 font-bold">{finishedGame.teamB.overs || 0} overs</p>}
                </div>
              </div>
            </div>

            {/* MVP Selector Carousel */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">Vote Match MVP 🏆</label>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setMvpIdx((prev) => (prev - 1 + squadPlayers.length) % squadPlayers.length)}
                  className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-sm text-slate-700 hover:bg-slate-300 active:scale-95 transition"
                >
                  ◀
                </button>
                <div className="text-center">
                  <img src={squadPlayers[mvpIdx]?.avatar} alt="" className="w-12 h-12 rounded-full mx-auto border-2 border-brand-primary object-cover" />
                  <p className="text-xs font-black text-brand-forest mt-1.5">{squadPlayers[mvpIdx]?.name}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">MVP Candidate</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMvpIdx((prev) => (prev + 1) % squadPlayers.length)}
                  className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-sm text-slate-700 hover:bg-slate-300 active:scale-95 transition"
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Stat Allocation List */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Allocate Match {isCricket ? 'Runs' : 'Goals'}</label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                {squadPlayers.map((player) => {
                  const currentAlloc = allocations[player.id] || 0;
                  return (
                    <div key={player.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <img src={player.avatar} alt="" className="w-6 h-6 rounded-lg object-cover" />
                        <span className="text-xs font-bold text-slate-700">{player.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAllocations(prev => ({
                            ...prev,
                            [player.id]: Math.max(0, currentAlloc - 1)
                          }))}
                          className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="font-extrabold text-xs text-brand-forest w-4 text-center">{currentAlloc}</span>
                        <button
                          type="button"
                          onClick={() => setAllocations(prev => ({
                            ...prev,
                            [player.id]: currentAlloc + 1
                          }))}
                          className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Caption Form */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Share match highlight caption</label>
              <textarea
                value={highlightCaption}
                onChange={(e) => setHighlightCaption(e.target.value)}
                placeholder="e.g. Rahul hit the winning goal in the final minute! What a thrilling game!"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm focus:outline-none focus:border-brand-primary h-24 resize-none"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleShareHighlight}
                className="w-full py-4 tm-btn-primary rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" /> Share to Locker Room Feed
              </button>
              
              <button
                onClick={() => { setFinishedGame(null); setHighlightCaption(''); }}
                className="w-full py-3.5 border border-slate-200 hover:border-slate-300 text-slate-500 font-bold text-sm rounded-2xl transition"
              >
                Done / Back to Tools
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up pb-8">
      <PageHeader
        title="live score"
        subtitle="in-game calculator · timer · goals · cricket"
        onBack={() => app.setView('home')}
        badge="match day"
        action={
          liveGame && (
            <CricketUndoButton onUndo={undo} disabled={history.length <= 1} />
          )
        }
      />

      <div className="space-y-5">
        {!liveGame ? (
          <>
            {/* Sport picker */}
            <div className="grid grid-cols-2 gap-3">
              {SCORER_SPORTS.map((sid) => {
                const s = SPORTS.find((x) => x.id === sid);
                return (
                  <button
                    key={sid}
                    onClick={() => setSport(sid)}
                    className={`p-5 rounded-[24px] border text-left transition ${
                      sport === sid
                        ? 'border-brand-grassFresh tm-tint-green shadow-md'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <span className="text-3xl">{s.icon}</span>
                    <p className="font-display font-extrabold text-brand-forest mt-2 lowercase">{s.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {sid === 'cricket' ? 'runs, wickets, wides, extras' : 'goals, timer, halves'}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Team names */}
            <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase">team names</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={teamA}
                  onChange={(e) => setTeamA(e.target.value)}
                  className="px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-brand-forest focus:outline-none focus:border-brand-grassFresh"
                  placeholder="Team A"
                />
                <input
                  value={teamB}
                  onChange={(e) => setTeamB(e.target.value)}
                  className="px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-brand-forest focus:outline-none focus:border-brand-grassFresh"
                  placeholder="Team B"
                />
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 rounded-2xl tm-btn-primary font-bold text-lg flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" /> start {sportMeta?.name.toLowerCase()} match
            </button>

            <button
              onClick={() => app.setView('leaderboard')}
              className="w-full py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition"
            >
              view squad leaderboard →
            </button>

            {app.gameHistory?.length > 0 && (
              <div className="glass-card p-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">recent matches</p>
                <div className="space-y-2">
                  {app.gameHistory.slice(0, 5).map((g) => (
                    <div key={g.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-bold text-brand-forest capitalize">{g.sport}</p>
                        <p className="text-xs text-slate-400">{g.summary}</p>
                      </div>
                      <span className="text-[10px] font-bold text-brand-grassDeep uppercase">saved</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Timer bar */}
            <div className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl tm-icon-accent-green flex items-center justify-center">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">match timer</p>
                  <p className="text-2xl font-mono font-bold text-brand-forest">{formatTimer(liveGame.timerSeconds)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleTimer}
                  className="w-10 h-10 rounded-xl tm-btn-primary flex items-center justify-center !p-0"
                >
                  {liveGame.timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={resetTimer}
                  className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {liveGame.sport === 'cricket' ? (
              <CricketScorer game={liveGame} setGame={setGame} onHistoryPush={onHistoryPush} onUndo={undo} canUndo={history.length > 1} />
            ) : (
              <FootballScorer game={liveGame} setGame={setGame} onHistoryPush={onHistoryPush} onUndo={undo} canUndo={history.length > 1} />
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={discard}
                className="py-3.5 rounded-2xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition"
              >
                discard
              </button>
              <button
                onClick={endGame}
                className="py-3.5 rounded-2xl tm-btn-primary font-bold text-sm flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> end & save stats
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
