import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import OnboardingShell from '../../components/onboarding/OnboardingShell';
import Button from '../../components/ui/Button';

export default function OwnerPayoutPage() {
  const app = useApp();
  const [confirmAccount, setConfirmAccount] = useState('');

  const accountsMatch = app.onboardingData.bankAccount && confirmAccount === app.onboardingData.bankAccount;
  const canSubmit = 
    !app.payoutErrors.ifsc && 
    app.onboardingData.bankAccount && 
    accountsMatch &&
    app.onboardingData.ifsc && 
    app.onboardingData.accountHolder.trim();

  return (
    <OnboardingShell
      step={4}
      totalSteps={4}
      flow="owner"
      onBack={() => app.navigateTo('owner_kyc')}
      pill="partner · step 4"
      title="payout setup"
      subtitle="where we send your 90% share — verified via penny drop."
      footer={
        <div className="space-y-2">
          <Button size="lg" variant="grass" className="w-full" disabled={!canSubmit} onClick={() => canSubmit && app.submitOwnerApplication()}>
            submit for review <Check className="w-5 h-5" />
          </Button>
          <p className="text-[10px] text-center text-brand-muted font-bold">by joining you agree to 10% TurfMate commission on app bookings</p>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="tm-label">bank account number</label>
          <input type="text" value={app.onboardingData.bankAccount} onChange={(e) => app.updateOnboardingData({ bankAccount: e.target.value.replace(/\D/g, '').slice(0, 18) })} placeholder="account number" className="tm-input font-mono" />
        </div>
        <div>
          <label className="tm-label">confirm account number</label>
          <input 
            type="text" 
            value={confirmAccount} 
            onChange={(e) => setConfirmAccount(e.target.value.replace(/\D/g, '').slice(0, 18))} 
            placeholder="re-enter account number" 
            className={`tm-input font-mono ${confirmAccount && !accountsMatch ? '!border-red-400 focus:!border-red-400' : ''}`} 
          />
          {confirmAccount && !accountsMatch && (
            <p className="text-xs font-bold text-red-500 mt-1">account numbers do not match</p>
          )}
        </div>
        <div>
          <label className="tm-label">ifsc code</label>
          <input
            type="text"
            value={app.onboardingData.ifsc}
            onChange={(e) => {
              const val = e.target.value.toUpperCase().slice(0, 11);
              app.updateOnboardingData({ ifsc: val });
              if (val && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(val)) {
                app.setPayoutErrors(prev => ({ ...prev, ifsc: 'format: SBIN0012345' }));
              } else {
                app.setPayoutErrors(prev => { const c = { ...prev }; delete c.ifsc; return c; });
              }
            }}
            placeholder="SBIN0012345"
            className={`tm-input font-mono ${app.payoutErrors.ifsc ? '!border-red-400' : ''}`}
          />
          {app.payoutErrors.ifsc && <p className="text-xs font-bold text-red-500 mt-1">{app.payoutErrors.ifsc}</p>}
        </div>
        <div>
          <label className="tm-label">account holder</label>
          <input type="text" value={app.onboardingData.accountHolder} onChange={(e) => app.updateOnboardingData({ accountHolder: e.target.value })} placeholder="as per bank records" className="tm-input" />
        </div>
        <div className="tm-card p-4 bg-gradient-to-r from-brand-grassPale to-brand-accent/30">
          <p className="text-xs font-bold text-brand-grassInk leading-relaxed">
            💸 settlements hit your bank T+2 · track every booking in your partner dashboard
          </p>
        </div>
      </div>
    </OnboardingShell>
  );
}
