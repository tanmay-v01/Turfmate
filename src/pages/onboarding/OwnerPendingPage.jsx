import React from 'react';
import { Clock, Shield, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import GrassBackground from '../../components/ui/GrassBackground';

export default function OwnerPendingPage() {
  const app = useApp();

  const checks = [
    { label: 'PAN Validation (NSDL)', status: 'done' },
    { label: 'GSTIN Reference', status: app.userProfile.gstin ? 'done' : 'skip' },
    { label: 'Bank Penny Drop', status: 'pending' },
    { label: 'Document Review', status: 'pending' },
  ];

  return (
    <div className="min-h-screen dash-owner-bg relative flex flex-col">
      <GrassBackground />
      <div className="flex-grow flex flex-col justify-center p-6 max-w-md mx-auto w-full animate-fade-in relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-brand-grassPale border-2 border-amber-300 rounded-[28px] flex items-center justify-center text-4xl mx-auto shadow-soft animate-pulse-soft">
            ⏳
          </div>
          <span className="tm-pill mt-6 inline-flex">partner onboarding</span>
          <h2 className="text-2xl font-display font-extrabold text-white mt-4">Almost there!</h2>
          <p className="text-sm text-slate-500 font-bold mt-2 leading-relaxed">
            Hi <b className="text-white">{app.userProfile.ownerName || app.userProfile.name}</b> —{' '}
            <b className="text-white">{app.userProfile.businessName}</b> is under review.
            TurfMate takes 10% per booking; you keep 90%.
          </p>
        </div>

        <div className="dash-card p-5 space-y-3 mb-6">
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" /> Verification Progress
          </p>
          {checks.map(c => (
            <div key={c.label} className="flex items-center justify-between text-sm">
              <span className="font-bold text-white/80">{c.label}</span>
              {c.status === 'done' && <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-lime-400/10 text-lime-400">✓ Done</span>}
              {c.status === 'skip' && <span className="text-[10px] font-bold text-slate-500 italic">Optional</span>}
              {c.status === 'pending' && <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 animate-pulse flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => app.approveOwnerApplication(app.userProfile.ownerId)}
            className="w-full tm-btn-grass py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Fast-Track Approval (Demo)
          </button>
          <p className="text-[10px] text-center text-slate-500 font-bold">In production, TurfMate super admin approves from God Mode panel</p>
          <button
            onClick={() => { localStorage.removeItem('tm_profile'); app.setUserProfile({ isLoggedIn: false }); app.setView('welcome_carousel'); }}
            className="w-full py-2.5 text-slate-500 font-bold text-xs hover:text-white transition"
          >
            Cancel & restart
          </button>
        </div>
      </div>
    </div>
  );
}
