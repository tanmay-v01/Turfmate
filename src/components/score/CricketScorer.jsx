import { RotateCcw, ArrowLeftRight } from 'lucide-react';
import {
  cricketAddRuns, cricketWide, cricketNoBall, cricketWicket,
  cricketSwitchInnings, getCricketDisplay, formatTimer,
} from '../../utils/scoreEngine';

const RUN_BTNS = [
  { label: '+1', runs: 1 },
  { label: '+2', runs: 2 },
  { label: '+3', runs: 3 },
  { label: '+4', runs: 4 },
  { label: '+5', runs: 5 },
  { label: '+6', runs: 6 },
];

export default function CricketScorer({ game, setGame, onHistoryPush, onUndo, canUndo }) {
  const display = getCricketDisplay(game);
  const bat = game.batting === 'A' ? game.teamA : game.teamB;
  const bowl = game.batting === 'A' ? game.teamB : game.teamA;

  const apply = (fn, ...args) => {
    const next = fn(game, ...args);
    onHistoryPush(next);
    setGame(next);
  };

  return (
    <div className="space-y-4">
      {/* Scoreboard */}
      <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-grassDeep">live innings</span>
          <span className="text-sm font-mono font-bold text-slate-500">{formatTimer(game.timerSeconds)}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`rounded-2xl p-4 border-2 transition ${game.batting === 'A' ? 'border-brand-grassFresh bg-brand-grassPale/40' : 'border-slate-100 bg-slate-50'}`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase">{game.teamA.name}</p>
            <p className="text-2xl font-display font-extrabold text-brand-forest">{game.teamA.runs}/{game.teamA.wickets}</p>
            <p className="text-xs text-slate-400">{game.teamA.overs}.{game.teamA.balls} ov</p>
          </div>
          <div className={`rounded-2xl p-4 border-2 transition ${game.batting === 'B' ? 'border-brand-grassFresh bg-brand-grassPale/40' : 'border-slate-100 bg-slate-50'}`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase">{game.teamB.name}</p>
            <p className="text-2xl font-display font-extrabold text-brand-forest">{game.teamB.runs}/{game.teamB.wickets}</p>
            <p className="text-xs text-slate-400">{game.teamB.overs}.{game.teamB.balls} ov</p>
          </div>
        </div>

        <div className="text-center py-3 rounded-2xl bg-brand-forest text-white">
          <p className="text-[10px] font-bold uppercase opacity-80">batting</p>
          <p className="text-4xl font-display font-extrabold">{display.score}</p>
          <p className="text-sm opacity-90">{bat.name} · {display.overs} overs · max {game.maxOvers}</p>
          <p className="text-[11px] mt-1 opacity-75">extras: {game.extras.wides}w · {game.extras.noBalls}nb</p>
        </div>
      </div>

      {/* Run pad */}
      <div className="bg-white rounded-[24px] border border-slate-100 p-4 shadow-sm">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">runs</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {RUN_BTNS.map((b) => (
            <button
              key={b.label}
              onClick={() => apply(cricketAddRuns, b.runs)}
              className="py-4 rounded-2xl bg-brand-grassPale text-brand-forest font-display font-extrabold text-lg hover:bg-brand-grassFresh/30 active:scale-95 transition"
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Extras & wicket */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => apply(cricketWide)}
          className="py-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 font-bold text-sm hover:bg-amber-100 transition"
        >
          wide +1
        </button>
        <button
          onClick={() => apply(cricketNoBall, 0)}
          className="py-4 rounded-2xl bg-orange-50 border border-orange-200 text-orange-800 font-bold text-sm hover:bg-orange-100 transition"
        >
          no ball +1
        </button>
        <button
          onClick={() => apply(cricketNoBall, 4)}
          className="py-4 rounded-2xl bg-orange-50 border border-orange-200 text-orange-800 font-bold text-sm hover:bg-orange-100 transition"
        >
          nb +4
        </button>
        <button
          onClick={() => apply(cricketWicket)}
          className="py-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-bold text-sm hover:bg-red-100 transition"
        >
          wicket
        </button>
      </div>

      {game.status === 'innings_break' && (
        <button
          onClick={() => apply(cricketSwitchInnings)}
          className="w-full py-4 rounded-2xl bg-brand-forest text-white font-bold flex items-center justify-center gap-2 hover:bg-brand-grassInk transition"
        >
          <ArrowLeftRight className="w-4 h-4" /> switch innings
        </button>
      )}

      {/* Event log */}
      {game.events.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 max-h-40 overflow-y-auto relative">
          <div className="flex items-center justify-between mb-2 sticky top-0 bg-white/90 backdrop-blur-sm pb-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">ball log</p>
            <CricketUndoButton onUndo={onUndo} disabled={!canUndo} />
          </div>
          <div className="space-y-1">
            {game.events.slice(0, 12).map((e) => (
              <p key={e.id} className="text-xs text-slate-600 font-medium">
                <span className="text-slate-300 font-mono mr-2">{formatTimer(e.ts)}</span>
                {e.label}
              </p>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-[11px] text-slate-400">
        {bowl.name} bowling · {game.maxOvers}-over format
      </p>
    </div>
  );
}

export function CricketUndoButton({ onUndo, disabled }) {
  return (
    <button
      onClick={onUndo}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition"
    >
      <RotateCcw className="w-3.5 h-3.5" /> undo
    </button>
  );
}
