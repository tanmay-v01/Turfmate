import { ChevronRight } from 'lucide-react';
import { SPORTS } from '../../constants/sports';
import { useApp } from '../../context/AppContext';
import OnboardingShell from '../../components/onboarding/OnboardingShell';
import Button from '../../components/ui/Button';

export default function SportsDnaPage() {
  const app = useApp();

  return (
    <OnboardingShell
      step={2}
      totalSteps={4}
      flow="player"
      backTo
      onBack={() => app.navigateTo('profile_setup')}
      pill="step 2 · sports dna"
      title="what do you play?"
      subtitle="tap your sports — we'll match you with the right squads & turfs."
      footer={
        <Button
          size="lg"
          variant="grass"
          className="w-full"
          disabled={
            app.onboardingData.favoriteSports.length === 0 ||
            app.onboardingData.favoriteSports.some(sportId => {
              const dna = app.onboardingData.sportsDNA[sportId];
              return !dna || !dna.skillLevel;
            })
          }
          onClick={() => app.navigateTo('location_permission')}
        >
          enable location <ChevronRight className="w-5 h-5" />
        </Button>
      }
    >
      <div className="space-y-5 max-h-[55vh] overflow-y-auto no-scrollbar pr-1">
        <div className="grid grid-cols-2 gap-2.5">
          {SPORTS.map(s => {
            const isFav = app.onboardingData.favoriteSports.includes(s.id);
            return (
              <button
                type="button"
                key={s.id}
                onClick={() => {
                  const favs = isFav
                    ? app.onboardingData.favoriteSports.filter(id => id !== s.id)
                    : [...app.onboardingData.favoriteSports, s.id];
                  const currentDNA = app.onboardingData.sportsDNA || {};
                  const updatedDNA = { ...currentDNA };
                  if (!updatedDNA[s.id]) {
                    updatedDNA[s.id] = { skillLevel: '', position: s.positions[0] };
                  }
                  app.updateOnboardingData({ favoriteSports: favs, sportsDNA: updatedDNA });
                }}
                className={`p-4 rounded-[20px] border text-left transition-all flex items-center gap-3 font-bold text-sm ${
                  isFav
                    ? 'tm-tint-green border-brand-grassFresh text-white shadow-sm scale-[1.02]'
                    : 'glass-card border-slate-200 text-slate-500 hover:border-brand-grassFresh'
                }`}
              >
                <span className="text-2xl">{s.icon}</span>
                <span>{s.name}</span>
              </button>
            );
          })}
        </div>

        {app.onboardingData.favoriteSports.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-white/10/50">
            <p className="tm-label">fine-tune your game</p>
            {app.onboardingData.favoriteSports.map(sportId => {
              const sport = SPORTS.find(s => s.id === sportId);
              if (!sport) return null;
              const dna = app.onboardingData.sportsDNA[sportId] || { skillLevel: 'Intermediate', position: sport.positions[0] };

              return (
                <div key={sportId} className="glass-card p-4 space-y-3 animate-fade-in">
                  <p className="font-extrabold text-white text-sm flex items-center gap-2">
                    <span>{sport.icon}</span> {sport.name}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">skill</label>
                      <select
                        value={dna.skillLevel || ''}
                        onChange={(e) => {
                          const curDNA = app.onboardingData.sportsDNA;
                          app.updateOnboardingData({
                            sportsDNA: { ...curDNA, [sportId]: { ...dna, skillLevel: e.target.value } },
                          });
                        }}
                        className="tm-input mt-1 py-2.5 text-xs"
                      >
                        <option value="">Select skill...</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Pro">Pro</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">position</label>
                      <select
                        value={dna.position}
                        onChange={(e) => {
                          const curDNA = app.onboardingData.sportsDNA;
                          app.updateOnboardingData({
                            sportsDNA: { ...curDNA, [sportId]: { ...dna, position: e.target.value } },
                          });
                        }}
                        className="tm-input mt-1 py-2.5 text-xs"
                      >
                        {sport.positions.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </OnboardingShell>
  );
}
