import { X } from 'lucide-react';

export default function GoalScorerPicker({ open, teamName, players, onPick, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-[24px] p-5 animate-slide-up">
        <div className="flex justify-between items-center mb-3">
          <p className="font-bold text-brand-forest text-sm">Who scored for {teamName}?</p>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {players.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPick(p)}
              className="py-3 px-2 rounded-xl border border-slate-200 text-xs font-bold text-brand-forest hover:border-brand-grassFresh hover:tm-tint-green transition truncate"
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onPick('')}
            className="py-3 px-2 rounded-xl border border-dashed border-slate-200 text-xs font-bold text-slate-400 col-span-2"
          >
            unknown / own goal
          </button>
        </div>
      </div>
    </div>
  );
}
