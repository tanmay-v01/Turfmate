import React, { useState } from 'react';
import {
  LayoutDashboard, Activity, LogOut, ArrowUpRight, ShieldCheck, MapPin, Search,
  UserCheck, XCircle, Menu, X, IndianRupee, Users, Settings, Zap, TrendingUp,
  Building2, Radio, ShieldAlert, Trash2, UserMinus, RefreshCw, Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatCard from '../../components/dashboard/StatCard';
import MiniBarChart from '../../components/dashboard/MiniBarChart';

import { adminApi } from '../../services/adminApi';
import { SPORTS } from '../../constants/sports';

const SUPER_ADMIN_PHONE = '9999999999';

export default function SuperAdminDashboardPage() {
  const app = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookingSearch, setBookingSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [flaggedItems, setFlaggedItems] = useState([
    {
      id: 'flag-1',
      postId: 'ann-1',
      accusedUser: {
        username: 'Amit',
        fullName: 'Amit S',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AmitS',
        reliabilityScore: 2.8,
        gamesPlayed: 14,
        splitsHosted: 0,
        skillTier: 'Bronze',
      },
      reporter: '@rahul_cricket',
      contentType: 'Locker Post',
      content: 'Amit kept complaining and insulted the team in chat after he missed the penalty split cost math.',
      reason: 'Toxic behavior / Harassment',
      reportedAt: '2 hours ago'
    },
    {
      id: 'flag-2',
      postId: 'ann-2',
      accusedUser: {
        username: 'toxic_player',
        fullName: 'Toxic Player',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Toxic',
        reliabilityScore: 1.5,
        gamesPlayed: 3,
        splitsHosted: 1,
        skillTier: 'Bronze',
      },
      reporter: '@sneha_rao',
      contentType: 'Locker Post',
      content: 'You guys are absolute garbage. I am not paying my share, deal with it.',
      reason: 'Abusive language / Threat of payment default',
      reportedAt: '4 hours ago'
    },
    {
      id: 'flag-3',
      postId: 'msg-45',
      accusedUser: {
        username: 'spammer_bob',
        fullName: 'Bob Johnson',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bob',
        reliabilityScore: 3.2,
        gamesPlayed: 5,
        splitsHosted: 0,
        skillTier: 'Bronze',
      },
      reporter: '@aniket_s',
      contentType: 'Chat Message',
      content: 'Join my telegram channel t.me/free_bets_99 for 100% win prediction and discount codes for turf slots!',
      reason: 'Unsolicited advertising / Spam',
      reportedAt: '1 day ago'
    }
  ]);

  const handleInspectUser = (username) => {
    const cleanUsername = username.replace(/^@/, '');
    const foundFlagged = flaggedItems.find(item => item.accusedUser.username === cleanUsername);
    if (foundFlagged) {
      setSelectedUser(foundFlagged.accusedUser);
    } else {
      setSelectedUser({
        username: cleanUsername,
        fullName: cleanUsername.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${cleanUsername}`,
        reliabilityScore: 4.8,
        gamesPlayed: 23,
        splitsHosted: 5,
        skillTier: 'Silver'
      });
    }
  };

  const handleDeletePost = (flagId, postId) => {
    setFlaggedItems(prev => prev.filter(item => item.id !== flagId));
    app.setAnnouncements(prev => prev.filter(ann => ann.id !== postId));
    app.showToast('Flagged post deleted successfully', 'success', 'Post Deleted');
  };

  const handleResetReliability = (username) => {
    setFlaggedItems(prev => prev.map(item => {
      if (item.accusedUser.username === username) {
        return {
          ...item,
          accusedUser: {
            ...item.accusedUser,
            reliabilityScore: 5.0
          }
        };
      }
      return item;
    }));
    setSelectedUser(prev => prev && prev.username === username ? { ...prev, reliabilityScore: 5.0 } : prev);
    app.showToast(`Reliability score for @${username} reset to 5.0`, 'success', 'Score Reset');
  };

  const handleSuspendUser = (username) => {
    app.showToast(`User @${username} has been suspended for 7 days`, 'info', 'User Suspended');
    app.banUser(username);
    setFlaggedItems(prev => prev.filter(item => item.accusedUser.username !== username));
    setSelectedUser(null);
  };

  const handlePermaBan = (username) => {
    app.banUser(username);
    setFlaggedItems(prev => prev.filter(item => item.accusedUser.username !== username));
    app.showToast(`User @${username} has been permanently banned`, 'info', 'User Banned');
  };

  const platform = app.getPlatformMetrics();
  const pendingOwners = app.owners.filter(o => o.approvalStatus === 'Pending_Approval' || o.approvalStatus === 'Pending');
  const approvedOwners = app.owners.filter(o => o.approvalStatus === 'Approved');
  const appBookings = app.bookings.filter(b => b.source === 'app');

  React.useEffect(() => {
    adminApi.listPendingKyc()
      .then(res => {
        if (res?.owners) {
          app.setOwners(prev => {
            const map = new Map(prev.map(o => [o.id, o]));
            res.owners.forEach(o => map.set(o.id, { ...map.get(o.id), ...o }));
            return Array.from(map.values());
          });
        }
      })
      .catch(err => console.warn('Failed to load pending KYC:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, mobile: true },
    { id: 'owners', label: 'Owners', icon: UserCheck, mobile: true, badge: pendingOwners.length },
    { id: 'turfs', label: 'Turfs', icon: MapPin, mobile: true },
    { id: 'bookings', label: 'Bookings', icon: Activity, mobile: true },
    { id: 'moderation', label: 'Moderation', icon: ShieldCheck, badge: flaggedItems.length, mobile: true },
    { id: 'system', label: 'System Health', icon: Zap, mobile: false },
    { id: 'settings', label: 'Settings', icon: Settings, mobile: false },
  ];

  const turfRows = app.turfs
    .filter(t => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(t => {
      const revenue = app.bookings.filter(b => b.turfId === t.id).reduce((s, b) => s + (b.paidAmount || 0), 0);
      const commission = app.bookings.filter(b => b.turfId === t.id).reduce((s, b) => s + (b.commissionAmount || 0), 0);
      const suspended = app.suspendedTurfIds.includes(t.id);
      return {
        id: t.id,
        name: t.name,
        owner: app.getTurfOwnerName(t.ownerId),
        ownerId: t.ownerId,
        status: suspended ? 'SUSPENDED' : (t.status === 'pending_review' ? 'PENDING' : 'ACTIVE'),
        revenue,
        commission,
        image: t.image,
      };
    });

  const formatMoney = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const chartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, i) => {
    const dayBookings = appBookings.filter((_, idx) => idx % 7 === i);
    return { label, value: dayBookings.reduce((s, b) => s + (b.commissionAmount || 0), 0) || (i === new Date().getDay() ? platform.totalCommission : 0) };
  });

  const recentActivity = [
    ...appBookings.slice(0, 5).map(b => ({
      id: b.id,
      type: 'booking',
      text: `${b.roster?.[0]} booked ${b.turfName}`,
      meta: `₹${b.paidAmount} · Commission ₹${b.commissionAmount || 0}`,
      time: b.bookedAt ? new Date(b.bookedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Recently',
    })),
    ...pendingOwners.slice(0, 2).map(o => ({
      id: o.id,
      type: 'owner',
      text: `${o.businessName} applied to join`,
      meta: 'Awaiting approval',
      time: o.joinedAt || 'Pending',
    })),
  ].slice(0, 6);

  const statusStyle = (status) => {
    if (status === 'ACTIVE') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (status === 'PENDING') return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    return 'bg-red-500/15 text-red-400 border-red-500/30';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-700 font-display">
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 dash-sidebar-super px-4 py-3 flex items-center justify-between border-b border-emerald-500/10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span className="font-display font-extrabold text-brand-text">God Mode</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl bg-white text-emerald-600">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`dash-sidebar-super fixed md:sticky top-0 h-screen w-64 flex flex-col z-40 transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:top-0 pt-14 md:pt-0`}>
        <div className="p-6 hidden md:block">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-brand-grassFresh/15 border border-brand-grassFresh/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-display font-extrabold text-xl text-brand-text">TurfMate<span className="text-emerald-600">.</span></p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Platform Super Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`dash-nav-item dash-nav-item-super ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{tab.label}</span>
              {tab.badge > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{tab.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-emerald-500/10">
          <button onClick={() => app.setView('home')} className="dash-nav-item dash-nav-item-super w-full mb-1">
            <Radio className="w-4 h-4" /> View Player App
          </button>
          <button onClick={() => app.setView('login')} className="dash-nav-item dash-nav-item-super w-full !text-red-400 hover:!bg-red-500/10">
            <LogOut className="w-4 h-4" /> Exit God Mode
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 flex flex-col min-w-0 min-h-screen pt-14 md:pt-0 pb-20 md:pb-0">
        <header className="hidden md:flex border-b border-emerald-500/10 bg-slate-950/80 backdrop-blur px-6 lg:px-8 py-4 items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-extrabold text-brand-text">{TABS.find(t => t.id === activeTab)?.label}</h1>
            <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider mt-0.5">10% commission on all app bookings</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="dash-pill-live !bg-emerald-500/15 !text-emerald-400 !border-emerald-500/30">Platform Live</span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-grassFresh/20 to-brand-grass/10 border border-brand-grassFresh/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {activeTab === 'overview' && (
            <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
              <div className="dash-hero-super">
                <div className="relative z-10">
                  <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-2">TurfMate Platform</p>
                  <h2 className="text-2xl lg:text-3xl font-display font-extrabold text-brand-text">
                    {formatMoney(platform.totalCommission)} <span className="text-lg text-slate-600 font-bold">earned</span>
                  </h2>
                  <p className="text-sm text-slate-600 font-bold mt-1">{platform.totalBookings} bookings · {platform.activeTurfs} active turfs · {approvedOwners.length} partners</p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <StatCard variant="super" label="Gross Processed" value={formatMoney(platform.globalGross)} icon={TrendingUp} />
                <StatCard variant="super" label="Commission (10%)" value={formatMoney(platform.totalCommission)} sub="TurfMate revenue" icon={IndianRupee} />
                <StatCard variant="super" label="Active Turfs" value={platform.activeTurfs} sub={`${app.turfs.length} total`} icon={Building2} />
                <StatCard variant="super" label="Partners" value={approvedOwners.length} sub={pendingOwners.length ? `${pendingOwners.length} pending` : 'all approved'} icon={Users} />
              </div>

              <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 rounded-3xl border border-emerald-500/15 bg-white p-6">
                  <MiniBarChart data={chartData} label="Daily commission (₹)" dark />
                </div>
                <div className="lg:col-span-2 rounded-3xl border border-emerald-500/15 bg-white p-5">
                  <h3 className="font-extrabold text-brand-text text-sm mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-600" /> Live Activity
                  </h3>
                  <div className="space-y-1 max-h-52 overflow-y-auto">
                    {recentActivity.length === 0 ? (
                      <p className="text-slate-500 text-sm font-bold">No activity yet</p>
                    ) : recentActivity.map(item => (
                      <div key={item.id} className="flex gap-3 p-3 rounded-xl hover:bg-slate-700/30 transition">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.type === 'booking' ? 'bg-brand-grassFresh' : 'bg-amber-400'}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-brand-text truncate">{item.text}</p>
                          <p className="text-[10px] text-slate-500 font-bold">{item.meta}</p>
                        </div>
                        <span className="text-[10px] text-slate-600 font-bold shrink-0">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {pendingOwners.length > 0 && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-black">{pendingOwners.length}</div>
                    <div>
                      <p className="font-bold text-amber-200">Owner applications waiting</p>
                      <p className="text-xs text-amber-400/80 font-bold">Review KYC & approve partners</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('owners')} className="px-5 py-2.5 bg-amber-400 text-white text-xs font-black rounded-xl hover:bg-amber-300 transition">
                    Review Now →
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'owners' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
              <div>
                <h2 className="text-2xl font-display font-extrabold text-brand-text">Partner Applications</h2>
                <p className="text-sm text-slate-500 font-bold mt-1">Onboard turf owners to the platform · 10% commission on their bookings</p>
              </div>

              {pendingOwners.length === 0 ? (
                <div className="rounded-3xl border border-emerald-500/15 bg-white p-12 text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-slate-600 font-bold">All caught up — no pending applications</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingOwners.map(owner => (
                    <div key={owner.id} className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-brand-grassFresh/20 transition">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-grassFresh/10 border border-brand-grassFresh/20 flex items-center justify-center text-xl">🏟️</div>
                        <div>
                          <p className="font-extrabold text-brand-text text-lg">{owner.businessName}</p>
                          <p className="text-sm text-slate-600 font-bold">{owner.name} · {owner.phone}</p>
                          <p className="text-[10px] text-slate-500 mt-1">{owner.turfIds?.length || 0} turf · PAN {owner.pan || '—'} · Joined {owner.joinedAt}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => app.approveOwnerApplication(owner.id)} className="px-5 py-2.5 bg-brand-grassFresh text-white text-xs font-black rounded-xl hover:brightness-110 transition flex items-center gap-1.5 shadow-pill">
                          <UserCheck className="w-4 h-4" /> Approve Partner
                        </button>
                        <button onClick={() => app.rejectOwnerApplication(owner.id)} className="px-4 py-2.5 bg-red-500/15 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/25 transition flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <h3 className="text-lg font-extrabold text-brand-text mb-4">Active Partners ({approvedOwners.length})</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {approvedOwners.map(owner => {
                    const ownerRevenue = app.bookings.filter(b => b.ownerId === owner.id).reduce((s, b) => s + (b.paidAmount || 0), 0);
                    return (
                      <div key={owner.id} className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-brand-grassFresh/20 transition group">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-brand-text">{owner.businessName}</p>
                            <p className="text-xs text-slate-500 font-bold mt-0.5">{owner.turfIds?.length} turfs · {owner.phone}</p>
                            <p className="text-xs text-emerald-600 font-bold mt-2">{formatMoney(ownerRevenue)} processed</p>
                          </div>
                          <button onClick={() => app.loginAsOwner(owner.id)} className="text-[10px] font-black uppercase px-3 py-1.5 rounded-lg bg-brand-grassFresh/10 text-emerald-600 border border-brand-grassFresh/20 opacity-0 group-hover:opacity-100 transition">
                            Login As
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'turfs' && (
            <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-display font-extrabold text-brand-text">Turf Directory</h2>
                  <p className="text-sm text-slate-500 font-bold">{app.turfs.length} venues on platform</p>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search turfs..." className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 text-brand-text text-sm rounded-xl focus:outline-none focus:border-brand-grassFresh/50 w-full sm:w-64" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {turfRows.map(turf => (
                  <div key={turf.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-brand-grassFresh/25 transition group">
                    {turf.image && (
                      <div className="h-28 overflow-hidden relative">
                        <img src={turf.image} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition" />
                        <span className={`absolute top-3 right-3 text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${statusStyle(turf.status)}`}>
                          {turf.status}
                        </span>
                      </div>
                    )}
                    <div className="p-4">
                      <p className="font-extrabold text-brand-text">{turf.name}</p>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">{turf.owner}</p>
                      <div className="flex justify-between mt-3 text-xs font-bold">
                        <span className="text-slate-600">Revenue <span className="text-brand-text">₹{turf.revenue.toLocaleString()}</span></span>
                        <span className="text-emerald-600">Fee ₹{turf.commission.toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button onClick={() => app.loginAsOwner(turf.ownerId)} className="flex-1 py-2 text-[10px] font-black uppercase rounded-xl bg-brand-grassFresh/10 text-emerald-600 border border-brand-grassFresh/20 hover:bg-brand-grassFresh/20 transition">
                          Login As Owner
                        </button>
                        {turf.status === 'SUSPENDED' ? (
                          <button onClick={() => app.activateTurf(turf.id)} className="px-3 py-2 text-[10px] font-black uppercase rounded-xl bg-emerald-500/15 text-emerald-400">Activate</button>
                        ) : (
                          <button onClick={() => app.suspendTurf(turf.id)} className="px-3 py-2 text-[10px] font-black uppercase rounded-xl bg-red-500/15 text-red-400">Suspend</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (() => {
            const filteredBookings = appBookings.filter(b => {
              if (!bookingSearch) return true;
              const q = bookingSearch.toLowerCase();
              return (
                b.id.toLowerCase().includes(q) ||
                b.turfName.toLowerCase().includes(q) ||
                b.roster?.[0]?.toLowerCase().includes(q) ||
                (b.status || '').toLowerCase().includes(q)
              );
            });

            const handleForceRefund = (bId) => {
              app.setBookings(prev => prev.map(b => {
                if (b.id === bId) {
                  return {
                    ...b,
                    status: 'Refunded (Force Cancelled)',
                    paidAmount: 0,
                    ownerPayout: 0,
                    commissionAmount: 0
                  };
                }
                return b;
              }));
              app.showToast(`Refund processed for booking ${bId}`, 'success', 'Force Refunded');
              setSelectedBooking(null);
              
              // Push simulated notification to the player
              app.setNotifications(prev => [
                { id: Date.now(), text: `Refund issued for your slot booking ${bId}.`, time: 'Just now', read: false },
                ...prev
              ]);
            };

            return (
              <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-display font-extrabold text-brand-text">All App Bookings</h2>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">Click any booking row to inspect or issue a refund</p>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      placeholder="Search by ID, turf, user..."
                      className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 text-brand-text text-xs rounded-xl focus:outline-none focus:border-brand-grassFresh/50 w-full sm:w-64"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[640px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                        <th className="p-4">Booking</th>
                        <th className="p-4">Turf</th>
                        <th className="p-4">Player</th>
                        <th className="p-4 text-right">Gross</th>
                        <th className="p-4 text-right text-emerald-600">Commission</th>
                        <th className="p-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-500 font-bold">No bookings found matching search.</td>
                        </tr>
                      ) : filteredBookings.map(b => (
                        <tr 
                          key={b.id} 
                          onClick={() => setSelectedBooking(b)}
                          className="hover:bg-slate-700/20 transition cursor-pointer"
                        >
                          <td className="p-4">
                            <span className="font-mono text-xs text-slate-500">{b.id}</span>
                            <span className={`ml-2 text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${b.type === 'split' ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'}`}>{b.type}</span>
                          </td>
                          <td className="p-4 text-brand-text font-bold">{b.turfName}</td>
                          <td className="p-4 text-slate-600">{b.roster?.[0]}</td>
                          <td className="p-4 text-right text-brand-text font-bold">₹{b.paidAmount}</td>
                          <td className="p-4 text-right text-emerald-600 font-black">₹{b.commissionAmount || 0}</td>
                          <td className="p-4 text-right">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                              b.status?.toLowerCase().includes('refunded') 
                                ? 'bg-red-500/15 text-red-400' 
                                : b.status?.toLowerCase().includes('confirm') 
                                ? 'bg-emerald-500/15 text-emerald-400' 
                                : 'bg-amber-500/15 text-amber-400'
                            }`}>
                              {b.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Details Popup Modal */}
                {selectedBooking && (() => {
                  const b = app.bookings.find(bk => bk.id === selectedBooking.id) || selectedBooking;
                  const isRefunded = b.status?.toLowerCase().includes('refunded');
                  return (
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-slide-up text-left">
                        <button 
                          onClick={() => setSelectedBooking(null)}
                          className="absolute top-4 right-4 text-slate-600 hover:text-brand-text"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        
                        <h3 className="font-display font-extrabold text-brand-text text-lg mb-4">Inspect Booking</h3>
                        
                        <div className="space-y-3 text-xs border-b border-slate-800 pb-4">
                          <div className="flex justify-between"><span className="text-slate-500 font-bold uppercase">Booking ID</span><span className="font-mono text-brand-text">{b.id}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500 font-bold uppercase">Venue</span><span className="text-brand-text font-bold">{b.turfName}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500 font-bold uppercase">Host / Player</span><span className="text-brand-text font-bold">{b.roster?.[0]}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500 font-bold uppercase">Time Slot</span><span className="text-brand-text">{b.slotTime}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500 font-bold uppercase">Booking Type</span><span className="text-brand-text font-bold uppercase">{b.type}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500 font-bold uppercase">Status</span><span className="text-brand-text font-bold uppercase">{b.status}</span></div>
                        </div>

                        <div className="space-y-3 text-xs pt-4">
                          <div className="flex justify-between"><span className="text-slate-500 font-bold uppercase">Amount Paid</span><span className="text-brand-text font-bold">₹{b.paidAmount}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500 font-bold uppercase">Convenience Fee</span><span className="text-slate-600">₹20</span></div>
                          <div className="flex justify-between"><span className="text-emerald-600 font-bold uppercase">Commission (10%)</span><span className="text-emerald-600 font-black">₹{b.commissionAmount || 0}</span></div>
                          <div className="flex justify-between border-t border-dashed border-slate-800 pt-3"><span className="text-slate-600 font-extrabold uppercase">Owner Payout</span><span className="text-lg font-black text-brand-text">₹{b.ownerPayout || 0}</span></div>
                        </div>

                        <div className="flex gap-2 mt-6 pt-4 border-t border-slate-800">
                          <button onClick={() => setSelectedBooking(null)} className="flex-1 py-3 bg-white text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-700 transition">Close</button>
                          {!isRefunded && (
                            <button 
                              onClick={() => handleForceRefund(b.id)}
                              className="flex-1 py-3 bg-red-500 text-brand-text font-bold rounded-xl text-xs hover:bg-red-650 transition uppercase tracking-wider"
                            >
                              Force Refund
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </div>
            );
          })()}

          {activeTab === 'moderation' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in text-left">
              <div>
                <h2 className="text-2xl font-display font-extrabold text-brand-text">Trust & Safety Moderation</h2>
                <p className="text-sm text-slate-500 font-bold mt-1">Review flagged items, inspect user reliability, and enforce permanent bans.</p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Flagged items feed */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-lg font-extrabold text-brand-text flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-400" /> Pending Flagged Items ({flaggedItems.length})
                  </h3>

                  {flaggedItems.length === 0 ? (
                    <div className="rounded-3xl border border-emerald-500/15 bg-white p-12 text-center">
                      <div className="text-4xl mb-3">🛡️</div>
                      <p className="text-slate-600 font-bold">All clean! No flagged items found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {flaggedItems.map(item => {
                        const isBanned = app.bannedUsers.includes(item.accusedUser.username) || app.bannedUsers.includes(`@${item.accusedUser.username}`);
                        return (
                          <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 hover:border-red-500/20 transition">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${item.contentType === 'Chat Message' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'}`}>{item.contentType}</span>
                                <span className="text-[10px] text-slate-500 font-bold">{item.reportedAt}</span>
                              </div>
                              <span className="text-xs text-slate-600 font-bold">
                                Reported by <span className="text-slate-700 font-extrabold cursor-pointer hover:underline" onClick={() => handleInspectUser(item.reporter)}>{item.reporter}</span>
                              </span>
                            </div>

                            <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-850">
                              <p className="text-sm text-slate-350 italic">&quot;{item.content}&quot;</p>
                            </div>

                            <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                              <div className="flex items-center gap-3">
                                <img src={item.accusedUser.avatar} alt="" className="w-10 h-10 rounded-xl border border-slate-200 object-cover" />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-extrabold text-brand-text">@{item.accusedUser.username}</span>
                                    {isBanned && (
                                      <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[8px] font-black uppercase">Banned</span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-500 font-bold">Reliability Score: <span className={item.accusedUser.reliabilityScore < 3.0 ? 'text-red-400' : 'text-emerald-400'}>{item.accusedUser.reliabilityScore} / 5.0</span></p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 flex-wrap">
                                <button onClick={() => setSelectedUser(item.accusedUser)} className="px-3 py-1.5 bg-slate-700 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-650 transition">
                                  Inspect User
                                </button>
                                <button onClick={() => handleDeletePost(item.id, item.postId)} className="px-3 py-1.5 bg-slate-700/50 text-red-400 text-xs font-bold rounded-lg hover:bg-red-950/30 hover:text-red-300 transition flex items-center gap-1 border border-red-900/30">
                                  <Trash2 className="w-3.5 h-3.5" /> Delete Post
                                </button>
                                {!isBanned ? (
                                  <button onClick={() => handlePermaBan(item.accusedUser.username)} className="px-3 py-1.5 bg-red-500 text-brand-text text-xs font-black rounded-lg hover:bg-red-600 transition">
                                    Perma-Ban
                                  </button>
                                ) : (
                                  <button onClick={() => app.unbanUser(item.accusedUser.username)} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/30 transition">
                                    Unban
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right: Unban Manager */}
                <div className="space-y-4">
                  <h3 className="text-lg font-extrabold text-brand-text flex items-center gap-2">
                    <UserMinus className="w-5 h-5 text-amber-400" /> Unban Manager
                  </h3>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Banned Users ({app.bannedUsers.length})</p>

                    {app.bannedUsers.length === 0 ? (
                      <p className="text-slate-500 text-xs font-bold py-2">No users are currently banned from the platform.</p>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                        {app.bannedUsers.map(username => {
                          const cleanName = username.replace(/^@/, '');
                          return (
                            <div key={username} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-slate-800 hover:border-slate-750 transition">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-xs shrink-0">🚫</div>
                                <span className="text-xs font-extrabold text-slate-350 truncate">{username}</span>
                              </div>
                              <button
                                onClick={() => app.unbanUser(cleanName)}
                                className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase rounded-lg hover:bg-emerald-500/20 transition shrink-0"
                              >
                                Revoke Ban
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* User Inspector Modal */}
              {selectedUser && (() => {
                const isBanned = app.bannedUsers.includes(selectedUser.username) || app.bannedUsers.includes(`@${selectedUser.username}`);
                return (
                  <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-slide-up text-left">
                      <button 
                        onClick={() => setSelectedUser(null)}
                        className="absolute top-4 right-4 text-slate-600 hover:text-brand-text"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      
                      <div className="flex items-center gap-4 mb-6">
                        <img src={selectedUser.avatar} alt="" className="w-16 h-16 rounded-2xl border-2 border-slate-200 object-cover" />
                        <div>
                          <h3 className="font-display font-extrabold text-brand-text text-lg">{selectedUser.fullName}</h3>
                          <p className="text-sm text-emerald-600 font-bold">@{selectedUser.username}</p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${isBanned ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              {isBanned ? 'Banned' : 'Active'}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-white text-slate-600 text-[9px] font-bold uppercase">{selectedUser.skillTier} Tier</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-3 text-center">
                          <p className="text-[9px] text-slate-500 font-bold uppercase">Reliability</p>
                          <p className={`text-lg font-black mt-1 ${selectedUser.reliabilityScore < 3.0 ? 'text-red-400' : 'text-emerald-400'}`}>{selectedUser.reliabilityScore} / 5.0</p>
                        </div>
                        <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-3 text-center">
                          <p className="text-[9px] text-slate-500 font-bold uppercase">Games Played</p>
                          <p className="text-lg font-black text-brand-text mt-1">{selectedUser.gamesPlayed}</p>
                        </div>
                        <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-3 text-center">
                          <p className="text-[9px] text-slate-500 font-bold uppercase">Splits Hosted</p>
                          <p className="text-lg font-black text-brand-text mt-1">{selectedUser.splitsHosted}</p>
                        </div>
                      </div>

                      <div className="space-y-3 text-xs border-t border-slate-800 pt-4 mb-6">
                        <div className="flex justify-between"><span className="text-slate-500 font-bold">REPORT HISTORY</span><span className="text-red-400 font-bold">2 reports this week</span></div>
                        <div className="flex justify-between"><span className="text-slate-500 font-bold">LFG ACTIVITY</span><span className="text-slate-355">Active on 3 squads</span></div>
                        <div className="flex justify-between"><span className="text-slate-500 font-bold">RELIABILITY RATING</span><span className="text-slate-355">{selectedUser.reliabilityScore < 3.0 ? 'Action Recommended' : 'Good Standing'}</span></div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button onClick={() => handleResetReliability(selectedUser.username)} className="flex-1 py-3 bg-white text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-750 transition flex items-center justify-center gap-1.5">
                            <RefreshCw className="w-3.5 h-3.5" /> Reset Reliability
                          </button>
                          <button onClick={() => handleSuspendUser(selectedUser.username)} className="flex-1 py-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold rounded-xl text-xs hover:bg-amber-500/20 transition flex items-center justify-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> Suspend (7d)
                          </button>
                        </div>
                        {!isBanned ? (
                          <button onClick={() => { handlePermaBan(selectedUser.username); setSelectedUser(null); }} className="w-full py-3 bg-red-500 text-brand-text font-extrabold rounded-xl text-xs hover:bg-red-650 transition uppercase tracking-wider">
                            Perma-Ban User
                          </button>
                        ) : (
                          <button onClick={() => { app.unbanUser(selectedUser.username); setSelectedUser(null); }} className="w-full py-3 bg-emerald-500 text-white font-extrabold rounded-xl text-xs hover:bg-emerald-450 transition uppercase tracking-wider">
                            Lift Ban
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <h2 className="text-2xl font-display font-extrabold text-brand-text">Platform Settings</h2>
              <div className="rounded-2xl border border-emerald-500/20 bg-white p-6 space-y-5">
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <div>
                    <p className="font-bold text-brand-text">Commission Rate</p>
                    <p className="text-xs text-slate-500 font-bold">Applied to all in-app bookings</p>
                  </div>
                  <span className="text-2xl font-black text-emerald-600">10%</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <div>
                    <p className="font-bold text-brand-text">Settlement Cycle</p>
                    <p className="text-xs text-slate-500 font-bold">Owner payout timing</p>
                  </div>
                  <span className="text-sm font-bold text-brand-text">T+2 Business Days</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <div>
                    <p className="font-bold text-brand-text">Active Regions</p>
                    <p className="text-xs text-slate-500 font-bold">Mumbai Metropolitan</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">Live</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <div>
                    <p className="font-bold text-brand-text">Partner Onboarding</p>
                    <p className="text-xs text-slate-500 font-bold">KYC + bank verification required</p>
                  </div>
                  <span className="dash-pill-live !text-emerald-400">Enabled</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="max-w-6xl mx-auto space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-display font-extrabold text-brand-text">System Health & Logs</h2>
                  <p className="text-sm text-slate-500 font-bold mt-1">Real-time performance and audit trails.</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-slate-800 text-slate-800 font-bold rounded-xl text-xs hover:bg-slate-700 transition">Export Logs</button>
                  <button className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold rounded-xl text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> All Systems Nominal
                  </button>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
                  <h3 className="font-extrabold text-brand-text flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" /> Server Resources
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-500">CPU Usage</span>
                        <span className="text-brand-text">14%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '14%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-500">Memory (RAM)</span>
                        <span className="text-brand-text">2.1 GB / 4.0 GB</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-amber-400 h-2 rounded-full" style={{ width: '52%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-500">Storage (DB)</span>
                        <span className="text-brand-text">18 GB / 50 GB</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-sky-400 h-2 rounded-full" style={{ width: '36%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 flex flex-col h-[400px]">
                  <h3 className="font-extrabold text-brand-text flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-amber-500" /> Live Activity Log
                  </h3>
                  <div className="flex-1 bg-slate-900 rounded-xl p-4 overflow-y-auto font-mono text-xs text-slate-300 space-y-2 border border-slate-800">
                    <p><span className="text-emerald-400">[20:41:05]</span> [AUTH] User &apos;Rahul Mehta&apos; logged in successfully.</p>
                    <p><span className="text-sky-400">[20:41:12]</span> [DB] Query /turfs executed in 14ms</p>
                    <p><span className="text-amber-400">[20:41:22]</span> [WARN] High latency detected on /payments/status (840ms)</p>
                    <p><span className="text-emerald-400">[20:41:45]</span> [BOOKING] Split game &apos;Night Football&apos; created by u_102.</p>
                    <p><span className="text-sky-400">[20:42:01]</span> [SOCKET] Room &apos;turf_7&apos; joined by 3 clients.</p>
                    <p><span className="text-red-400">[20:42:15]</span> [ERROR] Failed to send SMS OTP to +919999999999 (Gateway Timeout)</p>
                    <p><span className="text-emerald-400">[20:42:30]</span> [PAYMENT] Webhook received: charge.succeeded for ₹1200.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <nav className="dash-mobile-nav dash-mobile-nav-super md:hidden">
        {TABS.filter(t => t.mobile).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`dash-mobile-tab dash-mobile-tab-super relative ${activeTab === tab.id ? 'active' : ''}`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
            {tab.badge > 0 && <span className="absolute -top-0.5 right-1 w-4 h-4 bg-amber-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">{tab.badge}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}
