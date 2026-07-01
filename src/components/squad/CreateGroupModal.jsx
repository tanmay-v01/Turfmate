import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';


export default function CreateGroupModal({ open, onClose }) {
  const app = useApp();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState([]);

  if (!open) return null;

  const friends = [];

  const toggle = (friendName) => {
    setSelected((prev) =>
      prev.includes(friendName) ? prev.filter((n) => n !== friendName) : [...prev, friendName]
    );
  };

  const handleSave = () => {
    if (!name.trim() || selected.length === 0) return;
    app.createSquadGroup(name.trim(), selected);
    setName('');
    setSelected([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-t-[28px] sm:rounded-[28px] p-5 max-h-[85vh] overflow-y-auto animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display font-extrabold text-slate-800 lowercase">create squad group</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name (e.g. Sunday Footballers)"
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-brand-grassFresh mb-4"
        />

        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">select friends</p>
        <div className="space-y-1 max-h-48 overflow-y-auto mb-4">
          {friends.map((f) => {
            const on = selected.includes(f.name);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => toggle(f.name)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition text-left ${
                  on ? 'border-brand-grassFresh tm-tint-green' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <img src={f.avatar} alt="" className="w-9 h-9 rounded-xl object-cover" />
                <span className="flex-1 font-bold text-sm text-slate-800">{f.name}</span>
                {on && <Check className="w-4 h-4 text-emerald-600" />}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!name.trim() || selected.length === 0}
          onClick={handleSave}
          className="w-full py-3.5 tm-btn-primary rounded-2xl font-bold text-sm disabled:opacity-40"
        >
          save group ({selected.length} player{selected.length !== 1 ? 's' : ''})
        </button>
      </div>
    </div>
  );
}
