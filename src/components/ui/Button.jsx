export default function Button({
  children,
  variant = 'grass',
  size = 'md',
  className = '',
  ...props
}) {
  const variants = {
    grass: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:shadow-emerald-500/30 active:scale-[0.97]',
    soft: 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-emerald-600',
    glass: 'bg-white/80 backdrop-blur-lg border border-slate-200 text-slate-700 hover:bg-white shadow-sm',
    dark: 'bg-slate-800 text-white hover:bg-slate-700 shadow-lg',
  };

  const sizes = {
    sm: 'px-4 py-2.5 text-sm rounded-full',
    md: 'px-6 py-3.5 text-sm rounded-full',
    lg: 'px-8 py-4 text-base rounded-full',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-display font-bold transition-all duration-300 active:scale-[0.96] disabled:opacity-40 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
