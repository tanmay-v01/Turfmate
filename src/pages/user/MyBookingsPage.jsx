import { useMemo, useState, useEffect } from 'react';
import { Calendar, MapPin, QrCode, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/ui/PageHeader';
import TurfImage from '../../components/ui/TurfImage';
import EmptyState from '../../components/ui/EmptyState';

function isPreviousBooking(booking) {
  const s = (booking.status || '').toLowerCase();
  return (
    s.includes('refund')
    || s.includes('cancel')
    || s.includes('failed')
    || s === 'completed'
  );
}

function BookingCard({ booking, turfs, onOpenTurf }) {
  const turf = turfs.find((t) => t.id === booking.turfId);
  const image = booking.image || turf?.image;

  return (
    <article className="glass-card p-4 flex gap-3 hover:shadow-md transition">
      <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
        {image ? (
          <TurfImage src={image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">⚽</div>
        )}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-sm text-brand-forest truncate">{booking.turfName || turf?.name || 'Turf booking'}</h3>
          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-brand-grassPale text-brand-grassDeep shrink-0">
            {booking.type === 'split' ? 'Split' : 'Private'}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {booking.date} · {booking.slotTime}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {turf?.city || 'Virar'}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-bold text-brand-forest">₹{booking.paidAmount || booking.totalAmount || 0}</span>
          <span className="text-[10px] font-semibold text-slate-500">{booking.status}</span>
        </div>
        {booking.qrCode && (
          <p className="text-[9px] font-mono text-slate-400 mt-1 flex items-center gap-1 truncate">
            <QrCode className="w-3 h-3 shrink-0" />
            {booking.qrCode}
          </p>
        )}
      </div>
      {turf && (
        <button
          type="button"
          onClick={() => onOpenTurf(turf.id)}
          className="self-center p-2 rounded-xl text-slate-400 hover:text-brand-forest hover:bg-brand-grassPale/50"
          aria-label="View turf"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </article>
  );
}

export default function MyBookingsPage() {
  const app = useApp();
  const [tab, setTab] = useState('current');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve(app.refreshMyBookings?.())
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [app.refreshMyBookings]);

  const { current, previous } = useMemo(() => {
    const mine = app.bookings;
    return {
      current: mine.filter((b) => !isPreviousBooking(b)),
      previous: mine.filter((b) => isPreviousBooking(b)),
    };
  }, [app.bookings]);

  const list = tab === 'current' ? current : previous;

  const openTurf = (turfId) => {
    app.setActiveTurfId(turfId);
    app.setView('turf_details');
  };

  return (
    <div className="tm-page animate-fade-up pb-28 lg:pb-10">
      <PageHeader
        title="My bookings"
        subtitle={loading ? 'Syncing…' : `${current.length} upcoming · ${previous.length} past`}
      />

      <div className="flex gap-2 p-1 bg-white/80 border border-slate-100 rounded-2xl mb-5">
        {[
          { id: 'current', label: 'Current', count: current.length },
          { id: 'previous', label: 'Previous', count: previous.length },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${
              tab === t.id
                ? 'tm-nav-primary text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {t.label}
            <span className={`ml-1.5 text-[10px] ${tab === t.id ? 'text-white/80' : 'text-slate-400'}`}>
              ({t.count})
            </span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={tab === 'current' ? 'No upcoming bookings' : 'No past bookings yet'}
          description={tab === 'current' ? 'Book a slot from Explore or any turf page.' : 'Completed and cancelled bookings appear here.'}
          actionText={tab === 'current' ? 'Explore turfs' : undefined}
          onAction={tab === 'current' ? () => app.setView('home') : undefined}
          className="my-10"
        />
      ) : (
        <div className="space-y-3">
          {list.map((b) => (
            <BookingCard key={b.id} booking={b} turfs={app.turfs} onOpenTurf={openTurf} />
          ))}
        </div>
      )}
    </div>
  );
}
