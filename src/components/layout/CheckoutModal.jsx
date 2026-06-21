import React from 'react';
import { X, Lock, Users, CreditCard, Sparkles, Minus, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calcCommission } from '../../constants/commission';
import Button from '../ui/Button';
import TurfImage from '../ui/TurfImage';

export default function CheckoutModal() {
  const app = useApp();
  const [promoCode, setPromoCode] = React.useState('');
  const [splitVisibility, setSplitVisibility] = React.useState('public');
  const [paymentMethod, setPaymentMethod] = React.useState('upi');
  const [cashConfirmed, setCashConfirmed] = React.useState(false);
  const [inviteGroupId, setInviteGroupId] = React.useState('');
  const [lockSecondsLeft, setLockSecondsLeft] = React.useState(null);

  React.useEffect(() => {
    if (!app.showCheckoutModal || !app.checkoutSlotLockExpiresAt) {
      setLockSecondsLeft(null);
      return;
    }
    const tick = () => {
      const left = Math.max(0, Math.ceil((app.checkoutSlotLockExpiresAt - Date.now()) / 1000));
      setLockSecondsLeft(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [app.showCheckoutModal, app.checkoutSlotLockExpiresAt]);

  if (!app.showCheckoutModal) return null;

  const slot = app.activeTurf.slots.find((s) => s.id === app.selectedSlotId);
  const slotPrice = slot?.surgePrice || app.activeTurf.pricePerHour;
  const ownerCommission = calcCommission(slotPrice);
  const taxes = Math.floor(slotPrice * 0.18);
  const totalPayable = slotPrice + 20 + taxes;
  const isSplit = app.checkoutOption === 'split';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-brand-forest/40 backdrop-blur-md" onClick={() => !app.isProcessingPayment && app.setShowCheckoutModal(false)} />

      <div className="relative w-full sm:max-w-md glass-grass rounded-t-[32px] sm:rounded-[32px] shadow-premium border border-brand-border/80 overflow-hidden animate-slide-up max-h-[92vh] overflow-y-auto">
        <div className="p-5 sm:p-6 space-y-5">
          <div className="flex justify-between items-start gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <TurfImage turf={app.activeTurf} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-brand-border" />
              <div>
                <span className="tm-pill text-[10px] mb-1.5">secure checkout</span>
                <h3 className="font-display font-extrabold text-lg text-brand-forest lowercase">book {app.activeTurf.name}</h3>
                <p className="text-xs font-bold text-brand-muted mt-0.5">{slot?.time} · {app.bookingDate}</p>
                {lockSecondsLeft != null && lockSecondsLeft > 0 && (
                  <p className="text-[10px] font-bold text-rose-600 mt-1 animate-pulse">
                    ⏳ slot reserved for {String(Math.floor(lockSecondsLeft / 60)).padStart(2, '0')}:{String(lockSecondsLeft % 60).padStart(2, '0')}
                  </p>
                )}
              </div>
            </div>
            <button disabled={app.isProcessingPayment} onClick={() => app.setShowCheckoutModal(false)} className="p-2 rounded-xl hover:bg-brand-grassPale text-brand-muted disabled:opacity-30">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'private', icon: Lock, label: 'private', sub: 'pay full slot' },
              { id: 'split', icon: Users, label: 'split', sub: 'squad up & share' },
            ].map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => app.setCheckoutOption(opt.id)}
                className={`p-4 rounded-[20px] border-2 text-center transition-all ${
                  app.checkoutOption === opt.id
                    ? 'border-brand-grassFresh tm-tint-green shadow-sm scale-[1.02]'
                    : 'border-slate-200 bg-white/90 text-slate-500 hover:border-slate-300'
                }`}
              >
                <opt.icon className={`w-5 h-5 mx-auto mb-1.5 ${app.checkoutOption === opt.id ? 'text-brand-grassDeep' : ''}`} />
                <span className="text-xs font-extrabold block text-brand-forest">{opt.label}</span>
                <span className="text-[10px] font-bold opacity-70">{opt.sub}</span>
              </button>
            ))}
          </div>

          <div className="tm-card p-4 space-y-2.5 text-sm">
            <div className="flex justify-between font-bold text-brand-muted"><span>slot price</span><span className="text-brand-forest">₹{slotPrice}</span></div>
            <div className="flex justify-between text-brand-muted"><span>convenience fee</span><span>₹20</span></div>
            <div className="flex justify-between text-brand-muted"><span>GST (18%)</span><span>₹{taxes}</span></div>
            <p className="text-[10px] text-brand-muted italic pt-1 border-t border-brand-border/40">
              turf gets ₹{slotPrice - ownerCommission} · TurfMate 10%
            </p>

            {isSplit && (
              <div className="pt-3 space-y-3 border-t border-brand-border/40">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-brand-forest">total players (incl. host)</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => app.setSplitPlayersCount(Math.max(2, app.splitPlayersCount - 1))} className="w-8 h-8 rounded-full tm-icon-accent-green flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                    <span className="font-black text-brand-forest w-6 text-center">{Math.max(2, app.splitPlayersCount)}</span>
                    <button onClick={() => app.setSplitPlayersCount(Math.min(12, app.splitPlayersCount + 1))} className="w-8 h-8 rounded-full tm-icon-accent-green flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex gap-2">
                  {['public', 'private'].map(v => (
                    <button key={v} onClick={() => setSplitVisibility(v)} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase border transition ${splitVisibility === v ? 'border-brand-grassFresh tm-tint-green text-brand-forest' : 'border-slate-200 text-slate-500'}`}>
                      {v === 'public' ? '🌐 public' : '🔒 invite only'}
                    </button>
                  ))}
                </div>
                <p className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-2 rounded-xl">
                  each player pays equal share: ₹{Math.ceil(totalPayable / Math.max(2, app.splitPlayersCount))}/head
                </p>
                {splitVisibility === 'private' && app.squadGroups?.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">invite squad group</label>
                    <select
                      value={inviteGroupId}
                      onChange={(e) => setInviteGroupId(e.target.value)}
                      className="w-full tm-input py-2 text-xs font-bold"
                    >
                      <option value="">select group (optional)</option>
                      {app.squadGroups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name} ({g.members.length})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t-2 border-brand-grassFresh/30">
              <span className="font-extrabold text-brand-forest">due now</span>
              <span className="text-2xl font-black text-brand-forest">
                ₹{isSplit ? Math.ceil(totalPayable / Math.max(2, app.splitPlayersCount)) : totalPayable}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'upi', label: 'UPI / Card' },
              { id: 'cash', label: 'Pay at Venue' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setPaymentMethod(m.id)}
                className={`py-2 rounded-xl text-xs font-bold border transition ${paymentMethod === m.id ? 'border-brand-grassFresh tm-tint-green text-brand-forest' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <input type="text" placeholder="promo code" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} className="tm-input py-2.5 text-xs font-mono uppercase" />

          {paymentMethod === 'cash' && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2">
              <input 
                type="checkbox" 
                id="cashConfirm" 
                checked={cashConfirmed} 
                onChange={(e) => setCashConfirmed(e.target.checked)}
                className="mt-1 accent-amber-600"
              />
              <label htmlFor="cashConfirm" className="text-[10px] font-bold text-amber-800 leading-tight">
                I confirm that I will pay ₹{isSplit ? app.activeTurf.minSplitAdvance : totalPayable} at the venue before playing. Failure to pay may result in a ban from booking.
              </label>
            </div>
          )}

          {app.isProcessingPayment ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-brand-grassPale border-t-brand-grassFresh animate-spin" />
              <p className="text-sm font-bold text-brand-forest">processing...</p>
            </div>
          ) : (
            <Button 
              size="lg" 
              variant="grass" 
              className="w-full" 
              onClick={() => {
                if (inviteGroupId && isSplit && splitVisibility === 'private') {
                  app.setCheckoutInviteGroupId(inviteGroupId);
                }
                app.processBookingPayment();
              }}
              disabled={paymentMethod === 'cash' && !cashConfirmed}
            >
              <CreditCard className="w-5 h-5" /> {paymentMethod === 'upi' ? 'pay with UPI' : 'confirm & book'}
            </Button>
          )}

          <p className="text-[10px] text-center text-brand-muted font-bold flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" /> demo sandbox — no real charge
          </p>
        </div>
      </div>
    </div>
  );
}
