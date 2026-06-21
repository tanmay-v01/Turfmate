export default function EmptyState({ icon: Icon, emoji, title, description, actionLabel, onAction, image }) {
  return (
    <div className="glass-card p-8 text-center">
      {image ? (
        <img src={image} alt="" className="w-full h-28 object-cover rounded-xl mb-4" />
      ) : Icon ? (
        <div className="w-12 h-12 rounded-2xl tm-icon-accent-green flex items-center justify-center mx-auto mb-3">
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
      ) : emoji ? (
        <p className="text-3xl mb-3">{emoji}</p>
      ) : null}
      <p className="font-display font-extrabold text-brand-forest lowercase">{title}</p>
      {description && <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-5 py-2.5 tm-btn-primary rounded-full text-sm font-semibold"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
