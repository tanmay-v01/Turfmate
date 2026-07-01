import { useState } from 'react';
import { Search, Navigation } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import OnboardingShell from '../../components/onboarding/OnboardingShell';
import Button from '../../components/ui/Button';

const LOCATIONS = [
  { name: 'Virar West, Mumbai', lat: 19.456, lng: 72.812 },
  { name: 'Virar East, Mumbai', lat: 19.458, lng: 72.825 },
  { name: 'Nala Sopara West, Thane', lat: 19.420, lng: 72.805 },
  { name: 'Vasai Road West, Thane', lat: 19.380, lng: 72.810 },
];

export default function LocationManualPage() {
  const app = useApp();
  const [query, setQuery] = useState('');
  const isLoggedIn = app.userProfile?.isLoggedIn;

  const filtered = LOCATIONS.filter((loc) =>
    loc.name.toLowerCase().includes(query.toLowerCase())
  );

  const pick = (loc) => {
    if (isLoggedIn) {
      app.updatePlayerLocation(loc);
      app.setView('home');
    } else {
      app.selectManualLocation(loc);
    }
  };

  const shell = isLoggedIn ? (
    <div className="min-h-screen bg-slate-50 px-4 py-8 max-w-lg mx-auto">
      <button onClick={() => app.setView('home')} className="text-sm font-bold text-slate-500 mb-6 hover:text-slate-800">
        ← back
      </button>
      <h1 className="text-2xl font-display font-extrabold text-slate-800 lowercase mb-1">change location</h1>
      <p className="text-sm text-slate-500 mb-6">pick where you usually play — affects turf & player discovery.</p>
      {renderContent()}
    </div>
  ) : (
    <OnboardingShell
      step={3}
      totalSteps={4}
      flow="player"
      onBack={() => app.navigateTo('location_permission')}
      pill="step 3 · location"
      title="pick your hood"
      subtitle="no GPS? no stress — choose where you usually play."
    >
      {renderContent()}
    </OnboardingShell>
  );

  function renderContent() {
    return (
      <div className="space-y-4">
        <Button
          type="button"
          variant="grass"
          size="md"
          className="w-full"
          disabled={app.isLocating}
          onClick={() => {
            if (isLoggedIn) {
              app.refreshUserLocation();
            } else {
              app.detectAndSetLocation({ finishOnboarding: true });
            }
          }}
        >
          <Navigation className={`w-4 h-4 ${app.isLocating ? 'animate-spin' : ''}`} />
          {app.isLocating ? 'locating…' : 'use precise GPS instead'}
        </Button>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search area..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-brand-grassFresh"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-50 shadow-sm">
          {filtered.map((loc) => (
            <button
              key={loc.name}
              type="button"
              onClick={() => pick(loc)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-emerald-50/30 transition group"
            >
              <span className="flex items-center gap-3 font-bold text-sm text-slate-800">
                <span className="text-lg">📍</span> {loc.name}
              </span>
              <span className="text-[10px] font-black uppercase text-emerald-600 opacity-0 group-hover:opacity-100 transition">
                select →
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="p-6 text-center text-sm text-slate-400">No areas match — try Virar or Vasai.</p>
          )}
        </div>

        <p className="text-[10px] text-center text-slate-400 font-medium">
          matchmaking uses your play radius from map settings
        </p>
      </div>
    );
  }

  return shell;
}
