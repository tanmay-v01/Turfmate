import { X, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Button from '../ui/Button';

export default function BookingSuccessModal() {
  const app = useApp();
  const data = app.bookingSuccessData;

  if (!data) return null;

  const isSplit = data.type === 'split';

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-pop">
        <div className="bg-gradient-to-br from-brand-grassPale to-white px-5 pt-5 pb-4 border-b border-slate-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-10 h-10 rounded-2xl bg-brand-grassFresh/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Payment successful</p>
                <h2 className="text-lg font-display font-extrabold text-slate-800">Your slot is booked!</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => app.setBookingSuccessData(null)}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-2xl border border-green-100 bg-green-50/80 p-4">
            <span className="text-[9px] bg-green-200 text-green-800 font-extrabold uppercase px-2 py-0.5 rounded">Booking confirmed</span>
            <h3 className="font-bold text-slate-800 mt-2">{data.turfName}</h3>
            <p className="text-sm text-slate-500">{data.date} · {data.slotTime}</p>
            <p className="text-[10px] font-mono text-slate-400 mt-2 truncate">{data.id}</p>
          </div>

          <div className="flex flex-col items-center p-4 bg-white border border-slate-200 rounded-2xl">
            <svg className="w-28 h-28" viewBox="0 0 100 100" aria-hidden>
              <rect width="100" height="100" fill="white" />
              <rect x="5" y="5" width="20" height="20" fill="#1B4332" />
              <rect x="9" y="9" width="12" height="12" fill="white" />
              <rect x="75" y="5" width="20" height="20" fill="#1B4332" />
              <rect x="79" y="9" width="12" height="12" fill="white" />
              <rect x="5" y="75" width="20" height="20" fill="#1B4332" />
              <rect x="9" y="79" width="12" height="12" fill="white" />
              <rect x="35" y="10" width="10" height="10" fill="#1B4332" />
              <rect x="30" y="30" width="20" height="20" fill="#1B4332" />
              <rect x="55" y="55" width="25" height="15" fill="#1B4332" />
            </svg>
            <span className="text-[9px] font-mono font-bold text-slate-400 mt-2">{data.qrCode}</span>
            <p className="text-[10px] text-slate-500 text-center mt-2">Show this QR at the venue desk for check-in.</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="grass"
              className="flex-1"
              onClick={() => {
                if (isSplit) {
                  app.setView('locker_room');
                } else if (data.chatId) {
                  app.setActiveChatId(data.chatId);
                  app.setView('chat');
                }
                app.setBookingSuccessData(null);
              }}
            >
              <MessageSquare className="w-4 h-4" />
              {isSplit ? 'Manage split' : 'Open game chat'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                app.setBookingSuccessData(null);
                app.setView('my_bookings');
              }}
            >
              My bookings
            </Button>
          </div>

          <button
            type="button"
            onClick={() => app.setBookingSuccessData(null)}
            className="w-full py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
