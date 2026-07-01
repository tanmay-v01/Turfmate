import { ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import OnboardingShell from '../../components/onboarding/OnboardingShell';
import Button from '../../components/ui/Button';

export default function OwnerBusinessPage() {
  const app = useApp();

  return (
    <OnboardingShell
      step={1}
      totalSteps={4}
      flow="owner"
      onBack={() => app.navigateTo('role_selection')}
      pill="partner · step 1"
      title="your turf business"
      subtitle="list your arena on TurfMate — you keep 90% on every app booking."
      wide
      footer={
        <Button
          size="lg"
          variant="grass"
          className="w-full"
          disabled={!app.onboardingData.businessName.trim() || !app.onboardingData.ownerName.trim() || app.kycErrors.email || !app.onboardingData.businessEmail.trim()}
          onClick={() => app.navigateTo('owner_map')}
        >
          pin location <ChevronRight className="w-5 h-5" />
        </Button>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="tm-label">business / arena name</label>
          <input
            type="text"
            value={app.onboardingData.businessName}
            onChange={(e) => app.updateOnboardingData({ businessName: e.target.value })}
            placeholder="green valley arena"
            className="tm-input"
          />
        </div>
        <div>
          <label className="tm-label">owner / manager name</label>
          <input
            type="text"
            value={app.onboardingData.ownerName}
            onChange={(e) => app.updateOnboardingData({ ownerName: e.target.value })}
            placeholder="vikram singh"
            className="tm-input"
          />
        </div>
        <div>
          <label className="tm-label">business email</label>
          <input
            type="email"
            value={app.onboardingData.businessEmail}
            onChange={(e) => {
              const val = e.target.value;
              app.updateOnboardingData({ businessEmail: val });
              if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                app.setKycErrors(prev => ({ ...prev, email: 'invalid email format' }));
              } else {
                app.setKycErrors(prev => { const c = { ...prev }; delete c.email; return c; });
              }
            }}
            placeholder="contact@arena.com"
            className={`tm-input ${app.kycErrors.email ? '!border-red-400' : ''}`}
          />
          {app.kycErrors.email && <p className="text-xs font-bold text-red-500 mt-1">{app.kycErrors.email}</p>}
        </div>
        <div className="tm-card p-4 bg-brand-accent/30 border-brand-lime/30">
          <p className="text-xs font-bold text-emerald-600">
            💰 TurfMate takes 10% commission · payouts settle T+2 to your bank
          </p>
        </div>
      </div>
    </OnboardingShell>
  );
}
