import { ShieldAlert, UserPlus, X } from 'lucide-react';

export default function FriendRequestList({ requests, onAccept, onDecline }) {
  if (!requests.length) {
    return (
      <div className="tm-chat-empty-inline">
        <p className="text-2xl mb-2">🤝</p>
        <p className="font-display font-extrabold text-brand-forest lowercase text-sm">no pending requests</p>
        <p className="text-xs text-slate-500 mt-1">Friend requests from nearby players show up here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => (
        <article key={req.id} className="glass-card p-4">
          <div className="flex gap-3">
            <img src={req.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-sm text-brand-forest">{req.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{req.time} · {req.mutualFriends} mutual</p>
                </div>
                <span className="tm-chat-badge tm-chat-badge--lobby shrink-0">{req.sport}</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{req.message}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onDecline(req.id)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center gap-1 hover:bg-slate-50 transition"
            >
              <X className="w-3.5 h-3.5" /> decline
            </button>
            <button
              type="button"
              onClick={() => onAccept(req.id)}
              className="flex-1 py-2.5 tm-btn-primary rounded-xl text-xs font-bold flex items-center justify-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" /> accept
            </button>
          </div>
          <p className="flex items-center gap-1.5 text-[10px] text-amber-700 font-semibold mt-2">
            <ShieldAlert className="w-3 h-3 shrink-0" />
            Accept to reply and share images safely
          </p>
        </article>
      ))}
    </div>
  );
}
