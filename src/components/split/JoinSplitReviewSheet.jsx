import { Users, ShieldCheck, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function JoinSplitReviewSheet() {
  const app = useApp();
  const ann = app.pendingJoinSplitAnn;

  if (!app.pendingJoinSplitId || !ann) return null;

  const spotsLeft = ann.playersNeeded || 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-brand-forest/50 backdrop-blur-sm"
        onClick={() => !app.isProcessingPayment && app.closeJoinSplitReview()}
      />
      <div className="relative w-full sm:max-w-md bg-white/5 rounded-t-[28px] sm:rounded-[28px] shadow-premium border border-white/10 animate-slide-up overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <img
                src={ann.hostAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${ann.hostName}`}
                alt=""
                className="w-12 h-12 rounded-2xl border border-white/10 object-cover"
              />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">split invite</p>
                <p className="font-bold text-white text-sm">
                  {ann.hostName} invited you to squad up!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => app.closeJoinSplitReview()}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="tm-card p-4 space-y-2">
            <p className="font-display font-extrabold text-white">{ann.turfName}</p>
            <p className="text-xs text-slate-500 font-bold">{ann.time}</p>
            <p className="text-xs text-amber-700 font-bold flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Only {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left!
            </p>
          </div>

          <div className="flex justify-between items-center bg-slate-50 rounded-2xl p-4 border border-white/10">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">cost to join</p>
              <p className="text-2xl font-display font-extrabold text-white">₹{ann.costPerHead}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 justify-end">
                <ShieldCheck className="w-3.5 h-3.5 text-lime-400" /> escrow
              </p>
              <p className="text-[10px] text-slate-500 max-w-[140px]">Held securely until the game fills</p>
            </div>
          </div>

          {app.isProcessingPayment ? (
            <div className="flex flex-col items-center py-6 gap-2">
              <div className="w-10 h-10 rounded-full border-4 border-brand-grassPale border-t-brand-grassFresh animate-spin" />
              <p className="text-sm font-bold text-white">processing payment…</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => app.confirmJoinSplit()}
              className="w-full py-4 tm-btn-primary rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
            >
              Pay ₹{ann.costPerHead} & join squad
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
