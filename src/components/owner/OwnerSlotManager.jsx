import { Lock, Unlock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function OwnerSlotManager({ turf }) {
  const app = useApp();
  if (!turf) return null;

  const blocked = app.adminBlockedSlots[turf.id] || [];
  const turfBookings = app.getOwnerBookings(turf.id);

  return (
    <div className="p-4 lg:p-8 animate-fade-in max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-brand-forest">Slot Control</h2>
        <p className="text-sm font-bold text-brand-muted mt-1">Manage slots, tweak pricing, or manually mark slots as booked for {turf.name}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['Today', 'Tomorrow', 'Day After'].map(d => (
          <button
            key={d}
            onClick={() => app.setAdminSelectedDate(d)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              app.adminSelectedDate === d
                ? 'tm-btn-grass text-brand-forest shadow-pill'
                : 'bg-white border border-brand-border text-brand-muted hover:border-brand-grassFresh'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="dash-card divide-y divide-brand-border/40 overflow-hidden">
        {turf.slots?.map(s => {
          const isBlocked = blocked.includes(s.id);
          const isBooked = turfBookings.some(b => b.slotTime === s.time);
          const price = app.adminSlotPrices[s.id] || s.surgePrice || turf.pricePerHour;

          return (
            <div key={s.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isBlocked ? 'bg-slate-50 border border-slate-200 shadow-inner' : 'bg-white border border-transparent shadow-sm hover:border-brand-grassFresh/50'} rounded-2xl transition`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${
                  isBooked ? 'bg-brand-grassPale text-brand-grassDeep' : isBlocked ? 'bg-slate-200 text-slate-500' : 'bg-slate-50 border border-brand-border text-brand-muted'
                }`}>
                  {s.time?.split(':')[0]}
                </div>
                <div>
                  <p className="font-bold text-brand-forest text-sm">{s.time}</p>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    isBooked ? 'bg-brand-grassFresh/20 text-brand-grassDeep' :
                    isBlocked ? 'bg-slate-200 text-slate-600' : 'bg-brand-accent/60 text-brand-muted'
                  }`}>
                    {isBooked ? 'App Booking' : isBlocked ? 'Manual Booking' : 'Available'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1 border rounded-xl px-3 py-2 transition ${isBooked || isBlocked ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed' : 'bg-white border-brand-border focus-within:border-brand-grassDeep'}`}>
                  <span className="text-xs text-brand-muted font-bold">₹</span>
                  <input
                    type="number"
                    value={price}
                    disabled={isBooked || isBlocked}
                    onChange={e => app.handlePriceChange(s.id, e.target.value)}
                    className="w-16 text-sm font-black text-brand-forest bg-transparent focus:outline-none text-center disabled:cursor-not-allowed"
                  />
                </div>
                <button
                  disabled={isBooked}
                  onClick={() => app.toggleAdminSlot(turf.id, s.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    isBooked ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400' :
                    isBlocked ? 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100' :
                    'bg-slate-800 text-white hover:bg-black shadow-md'
                  }`}
                >
                  {isBlocked ? <><Unlock className="w-3.5 h-3.5" /> Unmark</> : <><Lock className="w-3.5 h-3.5" /> Mark Booked</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
