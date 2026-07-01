import { motion } from 'framer-motion';

/** Mini bar chart for dashboard analytics */
export default function MiniBarChart({ data = [], label, dark = false }) {
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div className={`dash-chart ${dark ? 'dash-chart-dark' : 'dark:bg-slate-800/80'}`}>
      {label && (
        <p className={`text-xs font-bold mb-4 ${dark ? 'text-slate-400' : 'text-brand-muted dark:text-slate-400'}`}>{label}</p>
      )}
      <div className="flex items-end gap-2 h-28">
        {data.map((d, i) => (
          <div key={d.label || i} className="flex-1 flex flex-col items-center gap-1.5 min-w-0 group relative">
            <div className="w-full flex flex-col justify-end h-20">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(8, (d.value / max) * 100)}%` }}
                transition={{ duration: 0.6, delay: i * 0.1, type: "spring" }}
                whileHover={{ scaleY: 1.05, filter: "brightness(1.1)" }}
                className={`w-full rounded-t-lg origin-bottom dash-bar ${dark ? 'dash-bar-dark' : 'dark:bg-emerald-500/80 group-hover:bg-emerald-500'}`}
                title={`${d.label}: ${d.value}`}
              />
            </div>
            <span className={`text-[9px] font-bold truncate w-full text-center ${dark ? 'text-slate-500' : 'text-brand-muted dark:text-slate-500'}`}>
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
