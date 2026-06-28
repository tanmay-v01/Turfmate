import { ArrowLeft } from 'lucide-react';

export default function PageHeader({ title, subtitle, onBack, action, badge, icon: Icon }) {
  return (
    <div className="sticky top-0 z-30 pt-4 pb-4 mb-4 bg-white/80 backdrop-blur-md border-b border-slate-100/50 animate-fade-up">
      <div className="flex items-start justify-between gap-4 px-1">
        <div className="min-w-0 flex-1">
          {onBack && (
            <button
              onClick={onBack}
              className="tm-icon-btn mb-3 !w-9 !h-9 !rounded-xl text-slate-500 hover:text-brand-forest"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          {badge && (
            <span className="tm-pill mb-2">
              {Icon && <Icon className="w-3 h-3" />}
              {badge}
            </span>
          )}
          <h1 className="text-2xl lg:text-[1.75rem] font-display font-extrabold text-brand-forest lowercase tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0 flex flex-wrap items-start justify-end gap-2">{action}</div>}
      </div>
    </div>
  );
}
