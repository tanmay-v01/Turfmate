export default function TurfMateLogo({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-9 h-9 rounded-[14px] text-sm',
    md: 'w-11 h-11 rounded-[18px] text-base',
    lg: 'w-16 h-16 rounded-[22px] text-xl',
    xl: 'w-[88px] h-[88px] rounded-[26px] text-3xl',
  };

  return (
    <div
      className={`${sizes[size]} bg-grass-btn flex items-center justify-center shadow-glow relative overflow-hidden animate-pop ${className}`}
    >
      <div className="absolute inset-0 bg-grass-shine animate-shimmer bg-[length:200%_100%] opacity-50" />
      <span className="relative font-display font-black text-whiteSoft drop-shadow-sm">T</span>
    </div>
  );
}
