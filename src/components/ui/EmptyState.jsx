import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function EmptyState({ icon: Icon, emoji, image, title, description, actionText, actionLabel, onAction, className }) {
  const cta = actionText || actionLabel;
  return (
    <div className={twMerge('flex flex-col items-center justify-center p-8 text-center space-y-5 relative overflow-hidden rounded-3xl', className)}>
      <div className="absolute inset-0 bg-white/[0.02] -z-10" />
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-lime-400/5 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
      
      {image ? (
        <img src={image} alt="" className="w-full h-28 object-cover rounded-xl mb-4 shadow-sm opacity-80" />
      ) : Icon ? (
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 shadow-sm flex items-center justify-center">
          <Icon className="w-8 h-8 text-lime-400" strokeWidth={1.5} />
        </div>
      ) : emoji ? (
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 shadow-sm flex items-center justify-center text-3xl">
          {emoji}
        </div>
      ) : null}

      <div className="space-y-1.5 max-w-[280px]">
        <h3 className="font-bold text-base text-slate-200">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
      {cta && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 tm-btn-primary rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
        >
          {cta}
        </button>
      )}
    </div>
  );
}
