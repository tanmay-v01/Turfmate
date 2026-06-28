import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function EmptyState({ icon: Icon, emoji, image, title, description, actionText, actionLabel, onAction, className }) {
  const cta = actionText || actionLabel;
  return (
    <div className={twMerge('flex flex-col items-center justify-center p-8 text-center space-y-5 relative overflow-hidden rounded-3xl', className)}>
      <div className="absolute inset-0 bg-brand-grassPale/10 -z-10" />
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-grassLight/20 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-brand-grassFresh/10 rounded-full blur-3xl -z-10" />
      
      {image ? (
        <img src={image} alt="" className="w-full h-28 object-cover rounded-xl mb-4 shadow-sm" />
      ) : Icon ? (
        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center ring-1 ring-brand-grassLight/50">
          <Icon className="w-8 h-8 text-brand-grassDeep" strokeWidth={1.5} />
        </div>
      ) : emoji ? (
        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center ring-1 ring-brand-grassLight/50 text-3xl">
          {emoji}
        </div>
      ) : null}

      <div className="space-y-1.5 max-w-[280px]">
        <h3 className="font-bold text-base text-brand-forest">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
      {cta && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 tm-btn-primary rounded-xl text-xs font-bold shadow-soft hover:shadow-card transition-all active:scale-[0.98]"
        >
          {cta}
        </button>
      )}
    </div>
  );
}
