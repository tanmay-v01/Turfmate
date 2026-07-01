import { Search, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import OnboardingShell from '../../components/onboarding/OnboardingShell';
import Button from '../../components/ui/Button';
import LocationPickerMap from '../../components/map/LocationPickerMap';

function pinFromSearch(val) {
  if (val.toLowerCase().includes('green')) {
    return { lat: 19.456, lng: 72.805, address: 'Green Valley Arena, Station Road, Virar West' };
  }
  if (val.toLowerCase().includes('kanakia')) {
    return { lat: 19.462, lng: 72.812, address: 'Kanakia Sports Hub, Fun Fiesta Road, Virar West' };
  }
  return { lat: 19.458, lng: 72.809, address: `${val}, Virar, Mumbai` };
}

export default function OwnerMapPage() {
  const app = useApp();
  const loc = app.onboardingData.pinnedLocation || { lat: 19.456, lng: 72.812, address: 'Tap the map to pin your turf entrance' };

  return (
    <OnboardingShell
      step={2}
      totalSteps={4}
      flow="owner"
      onBack={() => app.navigateTo('owner_business')}
      pill="partner · step 2"
      title="pin your turf"
      subtitle="tap the map or search — players use this for directions & matchmaking."
      wide
      footer={
        <Button size="lg" variant="grass" className="w-full" onClick={() => app.navigateTo('owner_kyc')}>
          legal & kyc <ChevronRight className="w-5 h-5" />
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="search address or landmark..."
            className="tm-input pl-11 pr-24 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                app.updateOnboardingData({ pinnedLocation: pinFromSearch(e.currentTarget.value) });
              }
            }}
          />
        </div>

        <LocationPickerMap
          position={loc}
          onChange={(next) => app.updateOnboardingData({ pinnedLocation: next })}
          height="h-56 sm:h-64"
        />

        <div className="tm-card p-4 flex gap-3">
          <span className="text-xl">📍</span>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">pinned location</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{loc.address}</p>
            <p className="text-[10px] font-mono text-slate-500 mt-1">{loc.lat}, {loc.lng}</p>
          </div>
        </div>
      </div>
    </OnboardingShell>
  );
}
