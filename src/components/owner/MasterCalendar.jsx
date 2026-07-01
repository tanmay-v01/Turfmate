import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, AlertCircle, Check, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function MasterCalendar() {
  const app = useApp();
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const activeTurf = app.turfs.find(t => t.id === app.ownerActiveTurfId) || app.turfs[0];
  const pitches = ['Pitch A (Premium)', 'Pitch B', 'Pitch C (Box)'];

  const getSlotStatus = (slot, pIdx) => {
    const slotKey = slot.id + (pIdx === 0 ? '' : pIdx === 1 ? '_pitchB' : '_pitchC');
    const blockedList = app.adminBlockedSlots[activeTurf.id] || [];
    if (blockedList.includes(slotKey)) {
      return 'BOOKED_OFFLINE';
    }

    const booking = app.bookings.find(b => 
      b.turfId === activeTurf.id && 
      b.slotTime === slot.time && 
      b.date === app.adminSelectedDate
    );

    if (booking && pIdx === 0) {
      if (booking.type === 'split') {
        return booking.status?.toLowerCase().includes('confirmed') && !booking.status?.toLowerCase().includes('pending')
          ? 'BOOKED_ONLINE'
          : 'SPLIT_PENDING';
      }
      return 'BOOKED_ONLINE';
    }

    return 'AVAILABLE';
  };

  const getSlotStyle = (status) => {
    switch (status) {
      case 'BOOKED_ONLINE': return 'bg-green-100 border-green-200 text-green-800 hover:bg-green-200 cursor-pointer';
      case 'SPLIT_PENDING': return 'bg-amber-100 border-amber-200 text-amber-800 hover:bg-amber-200 cursor-pointer';
      case 'BOOKED_OFFLINE': return 'bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200 cursor-pointer border-l-4 border-l-blue-500';
      default: return 'bg-white border-slate-200 hover:bg-slate-50 cursor-crosshair';
    }
  };

  const getSlotLabel = (status, slot, pIdx) => {
    switch (status) {
      case 'BOOKED_ONLINE': return 'Online';
      case 'SPLIT_PENDING': {
        const booking = app.bookings.find(b => 
          b.turfId === activeTurf.id && 
          b.slotTime === slot.time && 
          b.date === app.adminSelectedDate
        );
        const joinedCount = booking?.roster?.length || 1;
        const totalCount = booking?.totalSpots || 10;
        return `Split (${joinedCount}/${totalCount})`;
      }
      case 'BOOKED_OFFLINE': return 'Walk-In';
      default: return 'Available';
    }
  };

  const handleSlotClick = (slot, pIdx, status) => {
    const slotKey = slot.id + (pIdx === 0 ? '' : pIdx === 1 ? '_pitchB' : '_pitchC');
    if (status === 'AVAILABLE') {
      setSelectedSlot({ 
        pitch: pitches[pIdx], 
        time: slot.time,
        slotId: slot.id,
        slotKey: slotKey 
      });
      setShowWalkInModal(true);
    } else if (status === 'BOOKED_OFFLINE') {
      app.toggleAdminSlot(activeTurf.id, slotKey);
      app.showToast('Offline block removed — slot is now available.', 'success');
    } else {
      app.showToast(`Slot status: ${status === 'BOOKED_ONLINE' ? 'Online App Booking (Paid)' : 'Active Split-Pay Lobby'}`, 'info');
    }
  };

  const handleConfirmBlock = () => {
    if (!selectedSlot) return;
    app.toggleAdminSlot(activeTurf.id, selectedSlot.slotKey);
    app.showToast('Offline booking confirmed — slot blocked in app.', 'success');
    setShowWalkInModal(false);
  };

  return (
    <div className="p-4 lg:p-8 animate-fade-in max-w-7xl mx-auto flex flex-col h-full">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-slate-800">Master Calendar</h2>
          <p className="text-sm font-bold text-slate-500">Manage real-time inventory for {activeTurf.name}</p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button 
              onClick={() => app.setAdminSelectedDate(app.adminSelectedDate === 'Tomorrow' ? 'Today' : 'Yesterday')}
              className="p-2 hover:bg-slate-50 rounded-lg transition"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            </button>
            <span className="px-4 text-sm font-bold text-slate-800 min-w-[80px] text-center">{app.adminSelectedDate}</span>
            <button 
              onClick={() => app.setAdminSelectedDate(app.adminSelectedDate === 'Yesterday' ? 'Today' : 'Tomorrow')}
              className="p-2 hover:bg-slate-50 rounded-lg transition"
            >
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 flex items-center gap-2 transition">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 px-1 shrink-0">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-400"></div><span className="text-[10px] font-bold text-slate-500 uppercase">Online (App)</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-400"></div><span className="text-[10px] font-bold text-slate-500 uppercase">Split-Pay Pending</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-400"></div><span className="text-[10px] font-bold text-slate-500 uppercase">Offline (Walk-in)</span></div>
      </div>

      {/* The Grid */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* X-Axis: Pitches */}
        <div className="grid grid-cols-[100px_1fr_1fr_1fr] bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="p-4 border-r border-slate-200"></div>
          {pitches.map((p, i) => (
            <div key={i} className="p-4 border-r border-slate-200 text-center font-bold text-sm text-slate-800 truncate">
              {p}
            </div>
          ))}
        </div>

        {/* Grid Body */}
        <div className="flex-1 overflow-y-auto">
          {activeTurf.slots.map((slot) => (
            <div key={slot.id} className="grid grid-cols-[100px_1fr_1fr_1fr] border-b border-slate-200 min-h-[80px]">
              {/* Y-Axis: Time */}
              <div className="p-4 border-r border-slate-200 flex flex-col items-center justify-center bg-slate-50/50">
                <span className="text-[10px] font-black text-slate-500 text-center uppercase tracking-tighter leading-tight">
                  {slot.time.split(' - ')[0]}
                </span>
                <span className="text-[9px] font-bold text-slate-400 text-center leading-none mt-1">
                  (1hr)
                </span>
              </div>
              
              {/* Slots columns */}
              {pitches.map((_, pIdx) => {
                const status = getSlotStatus(slot, pIdx);
                return (
                  <div 
                    key={pIdx} 
                    onClick={() => handleSlotClick(slot, pIdx, status)}
                    className={`border-r border-slate-200 p-2 flex items-center justify-center transition-all duration-200 ${getSlotStyle(status)}`}
                  >
                    <span className="text-xs font-black text-center uppercase tracking-wider">
                      {getSlotLabel(status, slot, pIdx)}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Walk-in Booking Modal */}
      {showWalkInModal && selectedSlot && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-slide-up">
            <h3 className="font-display font-extrabold text-slate-800 text-xl mb-1">Log Walk-In Booking</h3>
            <p className="text-xs font-bold text-slate-500 mb-6">Instantly block this slot from the public app.</p>

            <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-800 font-bold mb-1">
                <MapPin className="w-4 h-4 text-brand-primary" /> {selectedSlot.pitch}
              </div>
              <p className="text-xs text-slate-500 font-bold ml-6">{selectedSlot.time} (1 Hour) • ₹{activeTurf.pricePerHour}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Customer Name</label>
                <input type="text" placeholder="e.g. John Doe" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary transition" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Phone Number</label>
                <input type="tel" placeholder="+91 99999 99999" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary transition" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Payment Method</label>
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-emerald-50 border border-brand-primary text-slate-800 font-bold text-xs rounded-xl">Cash</button>
                  <button className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold text-xs rounded-xl transition">UPI / QR</button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowWalkInModal(false)} className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition">Cancel</button>
              <button 
                onClick={handleConfirmBlock}
                className="flex-1 py-3.5 bg-brand-forest text-slate-800 font-bold rounded-xl text-sm hover:bg-slate-800 transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Confirm & Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
