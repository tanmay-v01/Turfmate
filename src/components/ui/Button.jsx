export default function Button({
  children,
  variant = 'grass',
  size = 'md',
  className = '',
  ...props
}) {
  const variants = {
    grass: 'bg-lime-400 text-slate-900 shadow-lg shadow-lime-400/25 hover:bg-lime-300 active:scale-[0.97]',
    soft: 'bg-white/5 text-slate-300 border border-white/10 hover:border-lime-400/30 hover:text-lime-400',
    ghost: 'bg-transparent text-slate-300 hover:bg-white/5 hover:text-lime-400',
    glass: 'bg-white/5 backdrop-blur-lg border border-white/10 text-slate-200 hover:bg-white/10',
    dark: 'bg-lime-400 text-slate-900 hover:bg-lime-300 shadow-lg shadow-lime-400/25',
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
