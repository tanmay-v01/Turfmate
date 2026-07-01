import { X } from 'lucide-react';

export default function ChatMembersPanel({ chat, onClose, currentUserName }) {
  const roster = chat.meta?.roster || [];
  const members = chat.type === 'lobby'
    ? roster.length
      ? roster
      : ['Joshua Alvares', 'Aniket Sawant', 'Vikram Singh', 'Sneha Rao', currentUserName].filter(Boolean)
    : roster;

  return (
    <div className="tm-chat-members-overlay" onClick={onClose} role="presentation">
      <div className="tm-chat-members-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-extrabold text-slate-800 lowercase">
            {chat.type === 'lobby' ? 'lobby members' : 'game roster'}
          </h3>
          <button type="button" onClick={onClose} className="tm-icon-btn !w-8 !h-8 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {members.map((name) => (
            <li key={name} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50">
              <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`}
                alt=""
                className="w-9 h-9 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {name === currentUserName ? `${name} (you)` : name}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold">
                  {name === currentUserName ? 'host' : 'player'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
