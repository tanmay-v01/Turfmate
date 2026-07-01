import React, { useState } from 'react';
import {
  LayoutDashboard, Calendar as CalendarIcon, Megaphone, BarChart3, Settings, LogOut,
  Bell, Menu, X, ChevronDown, Check, MapPin, IndianRupee, Users, Zap, Clock,
  TrendingUp, Lock, Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatCard from '../../components/dashboard/StatCard';
import MiniBarChart from '../../components/dashboard/MiniBarChart';
import MasterCalendar from '../../components/owner/MasterCalendar';
import RevenueDashboard from '../../components/owner/RevenueDashboard';
import OwnerSlotManager from '../../components/owner/OwnerSlotManager';
import OwnerBroadcast from '../../components/owner/OwnerBroadcast';

function OwnerOverview({ selectedTurf, metrics, turfBookings, ownedTurfs, onTabChange }) {
  const formatINR = n => n.toLocaleString('en-IN');
  const utilization = Math.min(100, Math.round((metrics.bookingCount / (selectedTurf?.slots?.length || 8)) * 100));

  const weekData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, i) => ({
    label,
    value: i === new Date().getDay() - 1 ? metrics.bookingCount : Math.max(0, metrics.bookingCount - (3 - i)),
  }));

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-6xl mx-auto animate-fade-in">
      <div className="dash-hero">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="dash-pill-live mb-3">Partner Admin · Live</span>
            <h2 className="text-2xl lg:text-3xl font-display font-extrabold text-white">
              {selectedTurf?.name}
            </h2>
            <p className="text-sm font-bold text-slate-500 mt-1">
              {ownedTurfs.length} venue{ownedTurfs.length !== 1 ? 's' : ''} · You keep 90% on every app booking
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => onTabChange('slots')} className="px-4 py-2.5 bg-white/80 border border-white/10 rounded-xl text-xs font-bold text-white hover:shadow-soft transition flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Manage Slots
            </button>
            <button onClick={() => onTabChange('broadcast')} className="tm-btn-grass px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5" /> Broadcast
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard label="Your Net (90%)" value={`₹${formatINR(metrics.net)}`} sub={`Fee ₹${formatINR(metrics.commission)}`} icon={IndianRupee} variant="hero" />
        <StatCard label="App Bookings" value={metrics.bookingCount} sub={`${utilization}% utilization`} icon={CalendarIcon} trend="via TurfMate app" />
        <StatCard label="Pending Splits" value={metrics.pendingSplits} sub="needs more players" icon={Users} />
        <StatCard label="Gross Collected" value={`₹${formatINR(metrics.gross)}`} sub="before platform fee" icon={TrendingUp} variant="commission" />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 dash-card overflow-hidden">
          <div className="p-5 border-b border-white/10/50 flex justify-between items-center">
            <h3 className="font-extrabold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-lime-400" /> Live Schedule
            </h3>
            <span className="text-xs font-bold text-lime-400">{turfBookings.length} today</span>
          </div>
          <div className="divide-y divide-brand-border/30 max-h-[340px] overflow-y-auto">
            {turfBookings.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-4xl mb-3">🏟️</div>
                <p className="text-slate-500 font-bold text-sm">No bookings yet</p>
                <p className="text-xs text-slate-500/80 mt-1">Share your TurfMate listing to get players booking!</p>
              </div>
            ) : turfBookings.slice(0, 6).map(b => (
              <div key={b.id} className="dash-activity-item mx-2 my-1">
                <div className="dash-activity-dot bg-brand-grassFresh" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">
                    {b.roster?.[0]} · {b.type === 'split' ? 'Split Game' : 'Private'}
                  </p>
                  <p className="text-xs text-slate-500 font-bold">{b.slotTime} · {b.date}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-lime-400/10 text-lime-400">
                      You get ₹{b.ownerPayout || 0}
                    </span>
                    {b.type === 'split' && b.paidAmount < b.totalAmount && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">Split open</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 dash-card p-5">
          <MiniBarChart data={weekData} label="Bookings this week" />
          <div className="mt-4 pt-4 border-t border-white/10/40">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-slate-500">Pitch utilization</span>
              <span className="text-lime-400">{utilization}%</span>
            </div>
            <div className="h-2.5 bg-lime-400/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-grass to-brand-grassFresh rounded-full transition-all duration-700" style={{ width: `${utilization}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { icon: Zap, label: 'Instant Payouts', desc: 'T+2 settlement to bank' },
          { icon: Users, label: 'Split Games', desc: 'Auto-fill from player app' },
          { icon: Megaphone, label: 'Broadcast', desc: 'Reach local players free' },
        ].map(item => (
          <div key={item.label} className="dash-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl tm-icon-accent-green flex items-center justify-center shrink-0">
              <item.icon className="w-5 h-5 text-lime-400" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">{item.label}</p>
              <p className="text-[10px] font-bold text-slate-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OwnerDashboardPage() {
  const app = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showTurfDropdown, setShowTurfDropdown] = useState(false);

  const ownedTurfs = app.getOwnerTurfs();
  const selectedTurf = ownedTurfs.find(t => t.id === app.ownerActiveTurfId) || ownedTurfs[0];
  const metrics = app.getOwnerRevenueMetrics(selectedTurf?.id);
  const turfBookings = app.getOwnerBookings(selectedTurf?.id);
  const ownerRecord = app.getOwnerById(app.getCurrentOwnerId());

  const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, mobile: true },
    { id: 'slots', label: 'Slots', icon: Lock, mobile: true },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon, mobile: true },
    { id: 'broadcast', label: 'Broadcast', icon: Megaphone, mobile: true },
    { id: 'revenue', label: 'Revenue', icon: BarChart3, mobile: true },
  ];

  const renderContent = () => {
    if (!selectedTurf && activeTab !== 'overview') {
      return (
        <div className="p-12 text-center">
          <p className="text-slate-500 font-bold">Add a turf to get started.</p>
          <button onClick={() => { const n = prompt('Venue name:'); if (n) app.addOwnerTurf(n); }} className="mt-4 tm-btn-grass px-6 py-2.5 rounded-xl text-sm font-bold">
            + Register Turf
          </button>
        </div>
      );
    }
    switch (activeTab) {
      case 'overview': return <OwnerOverview selectedTurf={selectedTurf} metrics={metrics} turfBookings={turfBookings} ownedTurfs={ownedTurfs} onTabChange={setActiveTab} />;
      case 'slots': return <OwnerSlotManager turf={selectedTurf} />;
      case 'calendar': return <MasterCalendar />;
      case 'broadcast': return <OwnerBroadcast ownedTurfs={ownedTurfs} />;
      case 'revenue': return <RevenueDashboard metrics={metrics} bookings={turfBookings} bankAccount={ownerRecord?.bankAccount} ifsc={ownerRecord?.ifsc} />;
      default: return <OwnerOverview selectedTurf={selectedTurf} metrics={metrics} turfBookings={turfBookings} ownedTurfs={ownedTurfs} onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen dash-owner-bg flex flex-col md:flex-row font-display">
      {app.impersonatingOwner && (
        <div className="fixed top-0 inset-x-0 z-[100] bg-rose-600 text-white px-4 py-2 flex items-center justify-between text-xs font-bold shadow-md">
          <span>Viewing as {app.impersonatingOwner.label} — Super Admin impersonation</span>
          <button type="button" onClick={() => app.exitImpersonation()} className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30">
            Exit
          </button>
        </div>
      )}
      {/* Mobile top bar */}
      <div className="md:hidden glass-grass sticky top-0 z-50 p-4 flex items-center justify-between border-b border-white/10/50">
        <div>
          <p className="font-display font-extrabold text-lg text-white">TurfMate<span className="text-lime-400">.</span></p>
          <p className="text-[10px] font-bold text-slate-500 uppercase">Partner Admin</p>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-xl tm-icon-accent-green text-white">
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`dash-sidebar fixed md:sticky top-0 h-screen w-64 flex flex-col z-40 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 hidden md:block">
          <p className="font-display font-extrabold text-2xl text-white">TurfMate<span className="text-lime-400">.</span></p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Partner Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
              className={`dash-nav-item ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10/50 space-y-1">
          <button className="dash-nav-item w-full">
            <Settings className="w-4 h-4" /> Settings
          </button>
          <button onClick={() => app.setView('home')} className="dash-nav-item w-full text-slate-500">
            <MapPin className="w-4 h-4" /> View Player App
          </button>
          <button onClick={() => app.setView('login')} className="dash-nav-item w-full !text-red-500 hover:!bg-red-50">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <main className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 md:pb-0">
        <header className="hidden md:flex glass-grass border-b border-white/10/50 px-6 lg:px-8 py-4 items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-extrabold text-white">{TABS.find(t => t.id === activeTab)?.label}</h1>
            <div className="relative">
              <button
                onClick={() => setShowTurfDropdown(!showTurfDropdown)}
                className="flex items-center gap-2 text-sm font-bold text-white bg-white/70 border border-white/10 px-4 py-2 rounded-xl hover:shadow-soft transition"
              >
                <MapPin className="w-4 h-4 text-lime-400" />
                {selectedTurf?.name || 'Select turf'}
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
              {showTurfDropdown && (
                <div className="absolute top-full left-0 mt-2 w-60 dash-card overflow-hidden z-50 shadow-premium">
                  <div className="p-3 bg-lime-400/10/50 text-[10px] font-bold text-slate-500 uppercase">Your venues</div>
                  {ownedTurfs.map(turf => (
                    <button
                      key={turf.id}
                      onClick={() => { app.setOwnerActiveTurfId(turf.id); setShowTurfDropdown(false); }}
                      className={`w-full text-left px-4 py-3 text-sm font-bold flex items-center justify-between hover:bg-lime-400/10/40 ${selectedTurf?.id === turf.id ? 'text-lime-400 bg-lime-400/10/60' : 'text-white'}`}
                    >
                      {turf.name}
                      {selectedTurf?.id === turf.id && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                  <div className="border-t border-white/10/40 p-2">
                    <button
                      onClick={() => { const n = prompt('New venue name:'); if (n) app.addOwnerTurf(n); setShowTurfDropdown(false); }}
                      className="w-full py-2 text-xs font-bold text-lime-400 hover:bg-lime-400/10 rounded-xl flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Turf
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 rounded-xl hover:bg-lime-400/10/50 text-slate-500">
              <Bell className="w-5 h-5" />
              {metrics.pendingSplits > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />}
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-white/10/50">
              <div className="text-right">
                <p className="text-sm font-bold text-white">{app.userProfile.name || ownerRecord?.name}</p>
                <p className="text-[10px] font-bold text-slate-500">{ownedTurfs.length} turf{ownedTurfs.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-grassPale to-brand-grassFresh/40 border-2 border-brand-grassFresh flex items-center justify-center text-white font-black">
                {(app.userProfile.name || 'O').charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">{renderContent()}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="dash-mobile-nav md:hidden">
        {TABS.filter(t => t.mobile).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`dash-mobile-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
