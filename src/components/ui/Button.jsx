export default function Button({
  children,
  variant = 'grass',
  size = 'md',
  className = '',
  ...props
}) {
  const variants = {
    grass: 'tm-btn-grass text-brand-forestSoft',
    soft: 'bg-brand-grassPale text-brand-grassInk border border-brand-border hover:bg-brand-grassLight hover:border-brand-grassFresh shadow-soft',
    ghost: 'bg-transparent text-brand-forest hover:bg-brand-grassPale/80',
    glass: 'glass-grass text-brand-forest hover:bg-white/90',
    dark: 'bg-brand-forest text-white hover:bg-brand-grassInk shadow-card',
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
