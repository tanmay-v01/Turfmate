import React from 'react';
import { IndianRupee, AlertTriangle, FileText, Download, BarChart3, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function RevenueDashboard({ metrics = {}, bookings = [], bankAccount, ifsc }) {
  const gross = metrics.gross || 0;
  const fee = metrics.commission || 0;
  const net = metrics.net || 0;
  const pending = Math.round(net * 0.15);

  const transactions = bookings.map(b => ({
    id: `#${b.id}`,
    date: b.bookedAt ? new Date(b.bookedAt).toLocaleString('en-IN') : b.date,
    type: b.type === 'split' ? 'Split Booking' : 'Full Booking',
    gross: b.paidAmount || 0,
    net: b.ownerPayout || 0,
    status: 'PROCESSED',
  }));

  const bankLabel = bankAccount ? `${ifsc?.slice(0, 4) || 'Bank'} x${bankAccount.slice(-4)}` : 'Bank not set';

  const settlements = net > 0 ? [
    { id: 'SET-LIVE', date: new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }), amount: pending, status: 'PROCESSING', expectedDate: 'T+2 business days', bank: bankLabel },
  ] : [];

  const renderStatus = (status) => {
    switch (status) {
      case 'SETTLED':
      case 'PROCESSED':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded flex items-center gap-1 w-max"><CheckCircle2 className="w-3 h-3" /> {status}</span>;
      case 'PROCESSING':
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase rounded flex items-center gap-1 w-max"><Clock className="w-3 h-3" /> {status}</span>;
      case 'FAILED':
      case 'REFUNDED':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded flex items-center gap-1 w-max"><AlertCircle className="w-3 h-3" /> {status}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 lg:p-8 animate-fade-in max-w-7xl mx-auto space-y-8">
      <div className="dash-hero !p-5">
        <h2 className="text-2xl font-display font-extrabold text-white">Revenue & Payouts</h2>
        <p className="text-sm font-bold text-slate-500 mt-1">Live from TurfMate bookings · 10% fee · You keep 90%</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dash-stat-card bg-white/5 border-white/10/60">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gross Collected</p>
          <p className="text-3xl font-black text-slate-200">₹{gross.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">From app bookings</p>
        </div>
        <div className="dash-stat-card bg-white/5 border-red-100">
          <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Platform Fees (10%)</p>
          <p className="text-3xl font-black text-red-600">-₹{fee.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">TurfMate Commission</p>
        </div>
        <div className="dash-stat-card bg-gradient-to-br from-brand-grassPale to-white border-brand-grassFresh/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><IndianRupee className="w-16 h-16 text-white" /></div>
          <p className="text-xs font-bold text-white uppercase tracking-wider mb-2">Your Net (90%)</p>
          <p className="text-3xl font-black text-white">₹{net.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Owner payout</p>
        </div>
        <div className="dash-stat-card bg-white/5 border-amber-200/60 relative">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Pending Settlement</p>
          <p className="text-3xl font-black text-amber-600">₹{pending.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">In transit to {bankLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/5 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-white">Transaction Ledger</h3>
              <button className="text-xs font-bold text-slate-500 flex items-center gap-1 hover:text-white transition">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm font-bold">No transactions yet. Bookings from the player app appear here instantly.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">ID & Type</th>
                      <th className="p-4 text-right">Gross</th>
                      <th className="p-4 text-right">Net (After 10%)</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 text-xs font-bold text-slate-500 whitespace-nowrap">{t.date}</td>
                        <td className="p-4">
                          <div className="font-bold text-white text-sm">{t.id}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">{t.type}</div>
                        </td>
                        <td className="p-4 text-right font-black text-sm text-slate-700">₹{t.gross}</td>
                        <td className="p-4 text-right font-black text-sm text-white">₹{t.net}</td>
                        <td className="p-4">{renderStatus(t.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white/5 rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-extrabold text-white mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-brand-primary" /> Business Analytics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Booking Volume</p>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-black text-white">{bookings.length}</span>
                  <span className="text-xs font-bold text-green-500 mb-1">app bookings</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-lime-400 rounded-full" style={{ width: `${Math.min(100, bookings.length * 12)}%` }}></div>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Split Games Active</p>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-black text-slate-700">{metrics.pendingSplits || 0}</span>
                  <span className="text-xs font-bold text-slate-400 mb-1">awaiting players</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min(100, (metrics.pendingSplits || 0) * 25)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white/5 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-white">Settlements</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase">T+2 Cycle</p>
            </div>
            <div className="p-5 space-y-6">
              {settlements.length === 0 ? (
                <p className="text-sm text-slate-400 font-bold">No pending settlements.</p>
              ) : settlements.map((s, i) => (
                <div key={s.id} className="relative pl-6">
                  {i !== settlements.length - 1 && <div className="absolute left-2.5 top-6 bottom-[-24px] w-0.5 bg-slate-100"></div>}
                  <div className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center ${s.status === 'SETTLED' ? 'bg-green-500' : 'bg-amber-400 animate-pulse'}`}></div>
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-sm text-white">₹{s.amount.toLocaleString()} <span className="text-xs text-slate-400 font-normal">({s.date})</span></p>
                    {renderStatus(s.status)}
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Expected in {s.bank} by {s.expectedDate}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-white/10 bg-slate-50">
              <h3 className="font-extrabold text-white">Tax Invoices (GST)</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Platform fee invoices for ITC</p>
            </div>
            <div className="divide-y divide-slate-100">
              {['June 2026', 'May 2026'].map((month, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg"><FileText className="w-5 h-5" /></div>
                    <div>
                      <p className="font-bold text-sm text-white">{month}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Commission Tax Invoice</p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 hover:text-white transition" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
