import { ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import OnboardingShell from '../../components/onboarding/OnboardingShell';
import Button from '../../components/ui/Button';
import AvatarPicker from '../../components/onboarding/AvatarPicker';

export default function ProfileSetupPage() {
  const app = useApp();

  return (
    <OnboardingShell
      step={1}
      totalSteps={4}
      flow="player"
      onBack={() => app.navigateTo('role_selection')}
      pill="step 1 · profile"
      title="who are you?"
      subtitle="pick an avatar and username — this is how squads find you."
      footer={
        <Button
          type="submit"
          form="profile-form"
          size="lg"
          variant="grass"
          className="w-full"
          disabled={app.usernameError || !app.onboardingData.name.trim() || !app.onboardingData.username.trim()}
        >
          sports dna next <ChevronRight className="w-5 h-5" />
        </Button>
      }
    >
      <form id="profile-form" onSubmit={app.handleProfileSubmit} className="space-y-5">
        <div className="tm-card p-5 space-y-4">
          <div className="flex flex-col items-center gap-2">
            <img
              src={app.onboardingData.avatar}
              alt="avatar"
              className="w-24 h-24 rounded-[28px] border-4 border-brand-grassFresh/50 tm-icon-accent-green shadow-soft object-cover"
            />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">your avatar</p>
          </div>
          <AvatarPicker
            value={app.onboardingData.avatar}
            onChange={(url) => app.updateOnboardingData({ avatar: url })}
            compact
          />
        </div>

        <div>
          <label className="tm-label">full name</label>
          <input
            type="text"
            required
            value={app.onboardingData.name}
            onChange={(e) => app.updateOnboardingData({ name: e.target.value })}
            placeholder="rahul mehta"
            className="tm-input"
          />
        </div>

        <div>
          <label className="tm-label">username</label>
          <input
            type="text"
            required
            value={app.onboardingData.username}
            onChange={(e) => app.handleUsernameChange(e.target.value)}
            placeholder="@virar_striker"
            className={`tm-input ${app.usernameError ? '!border-red-400 !ring-red-100' : ''}`}
          />
          {app.usernameError && (
            <div className="mt-2 space-y-2">
              <p className="text-xs font-bold text-red-500">{app.usernameError}</p>
              {app.usernameSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {app.usernameSuggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => app.selectSuggestion(sug)}
                      className="px-3 py-1.5 tm-chip-neutral text-xs font-bold hover:border-brand-grassFresh transition"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {!app.usernameError && app.onboardingData.username.length > 1 && (
            <p className="text-xs font-bold text-emerald-600 mt-2">✓ username available</p>
          )}
        </div>
      </form>
    </OnboardingShell>
  );
}
