import { MapPin, Navigation } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import OnboardingShell from '../../components/onboarding/OnboardingShell';
import Button from '../../components/ui/Button';

export default function LocationPermissionPage() {
  const app = useApp();

  return (
    <OnboardingShell
      step={3}
      totalSteps={4}
      flow="player"
      centered
      pill="step 3 · location"
      title="find turfs near you"
      subtitle="high-accuracy GPS pins your map, turfs & play radius to where you actually are."
      footer={
        <div className="space-y-3">
          <Button
            size="lg"
            variant="grass"
            className="w-full"
            disabled={app.isLocating}
            onClick={() => app.grantLocation(true)}
          >
            <Navigation className={`w-5 h-5 ${app.isLocating ? 'animate-spin' : ''}`} />
            {app.isLocating ? 'getting precise location…' : 'use my precise location'}
          </Button>
          <button
            onClick={() => app.grantLocation(false)}
            disabled={app.isLocating}
            className="w-full py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition disabled:opacity-50"
          >
            pick neighborhood manually
          </button>
        </div>
      }
    >
      <div className="flex justify-center py-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-full tm-icon-accent-sky border-2 border-sky-200 flex items-center justify-center">
            <MapPin className="w-14 h-14 text-emerald-600 animate-bounce" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-brand-grassFresh/30 animate-ping" />
          <div className="absolute -inset-4 rounded-full border border-dashed border-brand-grassFresh/20" />
        </div>
      </div>
      <div className="tm-card p-4 text-center space-y-1">
        <p className="text-xs font-bold text-slate-500">
          uses GPS + reverse geocoding for your area name
        </p>
        <p className="text-[10px] text-slate-400">
          default radius <span className="text-emerald-600 font-bold">10 km</span> · refresh anytime on the map tab
        </p>
      </div>
    </OnboardingShell>
  );
}
