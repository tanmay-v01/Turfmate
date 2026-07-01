import { motion } from 'framer-motion';

/** Reusable stat card for owner & super-admin dashboards */
export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  variant = 'default',
  trend,
  className = '',
}) {
  const variants = {
    default: 'bg-white border-brand-border/60 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-200',
    hero: 'bg-gradient-to-br from-brand-grassPale via-white to-brand-accent/40 border-brand-grassFresh/30 dark:from-brand-forest/40 dark:via-slate-800 dark:to-slate-900',
    dark: 'bg-slate-800/60 border-slate-700/80 text-white',
    commission: 'bg-gradient-to-br from-brand-grassFresh/20 to-brand-grassPale border-brand-grassFresh/40 dark:from-brand-grassDeep/40 dark:to-brand-forest/60',
    super: 'bg-gradient-to-br from-slate-800 to-slate-900 border-brand-grassFresh/20',
  };

  const isDark = variant === 'dark' || variant === 'super';

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`dash-stat-card ${variants[variant]} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-brand-muted'}`}>
            {label}
          </p>
          <p className={`text-2xl sm:text-3xl font-black truncate ${isDark ? 'text-white' : 'text-brand-forest'}`}>
            {value}
          </p>
          {sub && (
            <p className={`text-[10px] font-bold mt-1.5 ${isDark ? 'text-slate-500' : 'text-brand-muted'}`}>
              {sub}
            </p>
          )}
          {trend && (
            <p className="text-[10px] font-bold text-brand-grassDeep mt-1 flex items-center gap-1">
              <span className="text-brand-grassFresh">↑</span> {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
            isDark ? 'bg-brand-grassFresh/15 text-brand-grassFresh' : 'bg-brand-grassPale text-brand-grassDeep'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
