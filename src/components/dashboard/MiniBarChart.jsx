/** Mini bar chart for dashboard analytics */
export default function MiniBarChart({ data = [], label, dark = false }) {
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div className={`dash-chart ${dark ? 'dash-chart-dark' : ''}`}>
      {label && (
        <p className={`text-xs font-bold mb-4 ${dark ? 'text-slate-400' : 'text-brand-muted'}`}>{label}</p>
      )}
      <div className="flex items-end gap-2 h-28">
        {data.map((d, i) => (
          <div key={d.label || i} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
            <div className="w-full flex flex-col justify-end h-20">
              <div
                className={`w-full rounded-t-lg transition-all duration-700 dash-bar ${dark ? 'dash-bar-dark' : ''}`}
                style={{ height: `${Math.max(8, (d.value / max) * 100)}%`, animationDelay: `${i * 80}ms` }}
                title={`${d.label}: ${d.value}`}
              />
            </div>
            <span className={`text-[9px] font-bold truncate w-full text-center ${dark ? 'text-slate-500' : 'text-brand-muted'}`}>
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
