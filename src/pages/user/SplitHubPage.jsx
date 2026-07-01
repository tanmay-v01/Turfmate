import { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Users, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { splitChatId } from '../../utils/chatMapper';

function formatCountdown(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function SplitHubPage() {
  const app = useApp();
  const [secondsLeft, setSecondsLeft] = useState(4 * 3600);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const activeSplit = app.announcements.find(
    (a) => a.hostName === app.userProfile.name && (a.status === 'open' || a.status === 'filled' || a.playersNeeded > 0)
  ) || app.announcements.find((a) => a.roster?.includes(app.userProfile.name) && (a.status === 'open' || a.status === 'filled'));

  const isHost = activeSplit?.hostName === app.userProfile.name;
  const chatId = splitChatId(activeSplit);

  useEffect(() => {
    if (!activeSplit?.fundingExpiresAt) return;
    const tick = () => {
      const left = Math.max(0, Math.floor((activeSplit.fundingExpiresAt - Date.now()) / 1000));
      setSecondsLeft(left);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeSplit?.fundingExpiresAt, activeSplit?.id]);

  const handleShare = async () => {
    if (!activeSplit) return;
    const link = app.getSplitInviteLink(activeSplit.id);
    const msg = `${app.userProfile.name} invited you to ${activeSplit.sportLabel} at ${activeSplit.turfName}! Pay ₹${activeSplit.costPerHead} to join: ${link}`;
    try {
      await navigator.clipboard.writeText(msg);
      app.showToast('Invite link copied to clipboard', 'success');
    } catch {
      app.showToast(msg, 'info', 'Share this invite');
    }
  };

  const openGameChat = () => {
    if (chatId) app.setActiveChatId(chatId);
    app.setView('chat');
  };

  if (!activeSplit || activeSplit.status === 'failed' || activeSplit.status === 'canceled') {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh] space-y-4 bg-slate-50">
        <AlertCircle className="w-12 h-12 text-slate-300" />
        <p className="text-slate-500 font-bold">No active split found</p>
        <button onClick={() => app.setView('locker_room')} className="text-slate-800 font-bold">
          browse locker room →
        </button>
      </div>
    );
  }

  const playersJoined = activeSplit.roster?.length || 0;
  const totalNeeded = playersJoined + (activeSplit.playersNeeded || 0);
  const progressPercent = totalNeeded ? (playersJoined / totalNeeded) * 100 : 100;
  const amountRemaining = (activeSplit.playersNeeded || 0) * (activeSplit.costPerHead || 0);
  const collected = (activeSplit.roster?.length || 0) * (activeSplit.costPerHead || 0);
  const totalTarget = totalNeeded * (activeSplit.costPerHead || 0);
  const isFilled = activeSplit.status === 'filled' || activeSplit.playersNeeded === 0;

  return (
    <div className="animate-fade-up flex flex-col min-h-screen bg-slate-50 pb-36">
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-20 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => app.setView('home')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display font-extrabold text-slate-800 leading-tight lowercase">split hub</h1>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">{activeSplit.turfName}</span>
          </div>
        </div>
        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${isFilled ? 'tm-tint-green text-slate-800' : 'bg-amber-100 text-amber-800'}`}>
          {isFilled ? '🟢 confirmed' : '🟡 pending funding'}
        </span>
      </div>

      <div className="p-4 space-y-4 flex-grow overflow-y-auto">
        <div className="bg-brand-forest rounded-3xl p-5 text-slate-800 shadow-md relative overflow-hidden">
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold uppercase">active escrow</span>
          <h2 className="text-xl font-display font-extrabold mt-2">{activeSplit.sportLabel}</h2>
          <p className="text-xs text-slate-800/80 mt-1">{activeSplit.time}</p>
          <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-800/60 block uppercase font-bold">collected</span>
              <span className="text-xl font-display font-extrabold">₹{collected} / ₹{totalTarget || collected}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-800/60 block uppercase font-bold">expires in</span>
              <span className="text-sm font-bold font-mono bg-white/10 px-2 py-1 rounded inline-flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5" /> {formatCountdown(secondsLeft)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-bold text-slate-700">funding progress</span>
              <span className="text-[10px] text-slate-500 block">{playersJoined}/{totalNeeded} players joined</span>
            </div>
            {!isFilled && (
              <span className="text-sm font-bold text-slate-800">₹{amountRemaining} remaining</span>
            )}
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-forest transition-all duration-700" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">roster (paid)</h4>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-50">
            {(activeSplit.roster || []).map((player, idx) => (
              <div key={player} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${player}`} alt="" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">{player}</span>
                    <span className="text-[9px] text-slate-400">{idx === 0 ? 'host' : 'joined'}</span>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-800 tm-tint-green px-2 py-1 rounded border">
                  <ShieldCheck className="w-3 h-3" /> paid
                </span>
              </div>
            ))}
            {Array.from({ length: activeSplit.playersNeeded || 0 }).map((_, idx) => (
              <div key={`empty-${idx}`} className="p-3 flex items-center gap-3 opacity-50 bg-slate-50/50">
                <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">?</div>
                <span className="text-xs font-bold text-slate-400">waiting for player...</span>
              </div>
            ))}
          </div>
        </div>

        {isHost && !isFilled && (
          <div className="pt-2 border-t border-slate-200">
            {!showCancelConfirm ? (
              <button
                type="button"
                onClick={() => setShowCancelConfirm(true)}
                className="w-full py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition"
              >
                cancel split & refund
              </button>
            ) : (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 space-y-2">
                <p className="text-xs text-rose-800 font-bold">Refund all joined players and release the slot?</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { app.cancelSplitGame(activeSplit.id); setShowCancelConfirm(false); app.setView('home'); }}
                    className="flex-1 py-2 bg-rose-600 text-slate-800 rounded-xl text-xs font-bold"
                  >
                    yes, cancel
                  </button>
                  <button type="button" onClick={() => setShowCancelConfirm(false)} className="flex-1 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600">
                    keep split
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-20 lg:bottom-4 inset-x-4 bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 z-30 shadow-lg">
        <button
          onClick={handleShare}
          className="flex-1 py-3.5 tm-btn-primary font-bold rounded-xl text-xs flex items-center justify-center gap-2 uppercase tracking-wide"
        >
          <Share2 className="w-4 h-4" /> copy invite link
        </button>
        <button
          onClick={openGameChat}
          className="px-5 py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition"
        >
          game chat
        </button>
      </div>
    </div>
  );
}
