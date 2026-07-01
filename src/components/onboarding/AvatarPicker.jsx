import { useState } from 'react';
import { Shuffle } from 'lucide-react';
import { AVATAR_STYLES, AVATAR_PRESETS, avatarUrl } from '../../data/images';

export default function AvatarPicker({ value, onChange, compact = false }) {
  const [style, setStyle] = useState('adventurer');

  const pickRandom = () => {
    const seed = AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)] + Math.floor(Math.random() * 100);
    onChange(avatarUrl(seed, style));
  };

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <div className="flex flex-wrap gap-2 justify-center">
        {AVATAR_STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStyle(s.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
              style === s.id
                ? 'bg-brand-forest text-slate-800 border-brand-forest'
                : 'bg-white text-slate-500 border-slate-200 hover:border-brand-grassFresh'
            }`}
          >
            <span>{s.emoji}</span> {s.label}
          </button>
        ))}
      </div>

      <div className={`grid gap-2 ${compact ? 'grid-cols-4' : 'grid-cols-4 sm:grid-cols-4'}`}>
        {AVATAR_PRESETS.map((seed) => {
          const url = avatarUrl(seed, style);
          const selected = value === url;
          return (
            <button
              key={`${style}-${seed}`}
              type="button"
              onClick={() => onChange(url)}
              className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition hover:scale-105 ${
                selected ? 'border-brand-grassFresh ring-2 ring-brand-grassFresh/40 scale-105' : 'border-slate-200 hover:border-brand-grassFresh/60'
              }`}
            >
              <img src={url} alt={seed} className="w-full h-full object-cover bg-emerald-50" />
              {selected && (
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-brand-forest text-slate-800 text-[10px] font-black flex items-center justify-center">✓</span>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={pickRandom}
        className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold text-emerald-600 bg-emerald-50 border border-slate-200 hover:bg-brand-grassLight transition"
      >
        <Shuffle className="w-3.5 h-3.5" /> random avatar
      </button>
    </div>
  );
}
