import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { footballAddGoal, footballUndoGoal, formatTimer } from '../../utils/scoreEngine';
import GoalScorerPicker from './GoalScorerPicker';

const DEFAULT_SQUAD = ['Rahul Mehta', 'Sneha Rao', 'Vikram Singh', 'Aniket Sawant', 'Joshua D'];

export default function FootballScorer({ game, setGame, onHistoryPush, roster = DEFAULT_SQUAD }) {
  const halfSeconds = game.halfMins * 60;
  const periodLabel = game.period === 'first' ? '1st half' : game.period === 'second' ? '2nd half' : 'full time';
  const [picker, setPicker] = useState(null);

  const apply = (fn, ...args) => {
    const next = fn(game, ...args);
    onHistoryPush(next);
    setGame(next);
  };

  const setPeriod = (period) => {
    const next = { ...game, period };
    onHistoryPush(next);
    setGame(next);
  };

  const requestGoal = (team) => {
    setPicker({ team, teamName: team === 'A' ? game.teamA.name : game.teamB.name });
  };

  const onPickScorer = (scorer) => {
    if (picker) apply(footballAddGoal, picker.team, scorer);
    setPicker(null);
  };

  return (
    <div className="space-y-4">
      <GoalScorerPicker
        open={!!picker}
        teamName={picker?.teamName}
        players={roster}
        onPick={onPickScorer}
        onClose={() => setPicker(null)}
      />

      <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-grassDeep">{periodLabel}</span>
          <span className="text-2xl font-mono font-bold text-brand-forest">{formatTimer(game.timerSeconds)}</span>
        </div>

        <div className="flex items-center justify-center gap-6 py-6">
          <TeamScore
            team={game.teamA}
            onGoal={() => requestGoal('A')}
            onUndo={() => apply(footballUndoGoal, 'A')}
          />
          <span className="text-3xl font-display font-extrabold text-slate-300">vs</span>
          <TeamScore
            team={game.teamB}
            onGoal={() => requestGoal('B')}
            onUndo={() => apply(footballUndoGoal, 'B')}
            align="right"
          />
        </div>

        <div className="flex gap-2 justify-center">
          {['first', 'half', 'second', 'full'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                game.period === p ? 'bg-brand-forest text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {p === 'first' ? '1st' : p === 'second' ? '2nd' : p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => requestGoal('A')}
          className="py-5 rounded-2xl bg-brand-grassPale border border-brand-grassFresh/40 font-display font-extrabold text-brand-forest hover:bg-brand-grassFresh/20 transition"
        >
          ⚽ {game.teamA.name} scores
        </button>
        <button
          onClick={() => requestGoal('B')}
          className="py-5 rounded-2xl bg-brand-grassPale border border-brand-grassFresh/40 font-display font-extrabold text-brand-forest hover:bg-brand-grassFresh/20 transition"
        >
          ⚽ {game.teamB.name} scores
        </button>
      </div>

      {game.events.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 max-h-36 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">goal log</p>
          {game.events.slice(0, 10).map((e) => (
            <p key={e.id} className="text-xs text-slate-600 font-medium py-0.5">
              <span className="text-slate-300 font-mono mr-2">{formatTimer(e.ts)}</span>
              {e.label}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function TeamScore({ team, onGoal, onUndo, align }) {
  return (
    <div className={`flex flex-col items-center gap-2 ${align === 'right' ? 'items-end' : ''}`}>
      <p className="text-xs font-bold text-slate-500 truncate max-w-[100px]">{team.name}</p>
      <p className="text-5xl font-display font-extrabold text-brand-forest">{team.goals}</p>
      <div className="flex gap-1">
        <button onClick={onGoal} className="w-10 h-10 rounded-full tm-btn-primary flex items-center justify-center"><Plus className="w-5 h-5" /></button>
        <button onClick={onUndo} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"><Minus className="w-5 h-5" /></button>
      </div>
    </div>
  );
}
