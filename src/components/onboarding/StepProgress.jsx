export default function StepProgress({ step, totalSteps, flow = 'player', className = '' }) {
  const pct = Math.round((step / totalSteps) * 100);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          {flow === 'owner' ? 'partner setup' : 'getting started'} · step {step}/{totalSteps}
        </span>
        <span className="text-[10px] font-bold text-emerald-600">{pct}%</span>
      </div>
      <div className="h-2 bg-emerald-50 rounded-full overflow-hidden border border-slate-200/50">
        <div
          className="h-full bg-gradient-to-r from-brand-grass to-brand-grassFresh rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
