import { ArrowLeft } from 'lucide-react';

export default function PageHeader({ title, subtitle, onBack, action, badge, icon: Icon }) {
  return (
    <div className="sticky top-0 z-30 pt-4 pb-4 mb-4 bg-[#090D19]/80 backdrop-blur-xl border-b border-white/5 animate-fade-up">
      <div className="flex items-start justify-between gap-4 px-1">
        <div className="min-w-0 flex-1">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-3 w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-slate-400 hover:text-lime-400 hover:border-lime-400/30 transition"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          {badge && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-lime-400/10 text-lime-400 border border-lime-400/20 mb-2">
              {Icon && <Icon className="w-3 h-3" />}
              {badge}
            </span>
          )}
          <h1 className="text-2xl lg:text-[1.75rem] font-display font-extrabold text-white lowercase tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0 flex flex-wrap items-start justify-end gap-2">{action}</div>}
      </div>
    </div>
  );
}
