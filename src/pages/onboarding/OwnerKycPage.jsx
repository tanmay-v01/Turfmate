import { Plus, ChevronRight, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import OnboardingShell from '../../components/onboarding/OnboardingShell';
import Button from '../../components/ui/Button';

export default function OwnerKycPage() {
  const app = useApp();

  const simulateUpload = (filename, step) => {
    app.setUploadingFile(true);
    app.setUploadProgress(0);
    const interval = setInterval(() => {
      app.setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          app.setUploadingFile(false);
          app.updateOnboardingData({ kycDoc: filename });
          return 100;
        }
        return prev + step;
      });
    }, 120);
  };

  return (
    <OnboardingShell
      step={3}
      totalSteps={4}
      flow="owner"
      onBack={() => app.navigateTo('owner_map')}
      pill="partner · step 3"
      title="legal & kyc"
      subtitle="PAN is required. GSTIN optional — needed for tax invoices on platform fees."
      wide
      footer={
        <Button
          size="lg"
          variant="grass"
          className="w-full"
          disabled={app.kycErrors.pan || !app.onboardingData.pan || !app.onboardingData.kycDoc}
          onClick={() => app.navigateTo('owner_payout')}
        >
          payout setup <ChevronRight className="w-5 h-5" />
        </Button>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="tm-label">gstin (optional)</label>
          <input type="text" value={app.onboardingData.gstin} onChange={(e) => app.updateOnboardingData({ gstin: e.target.value.toUpperCase() })} placeholder="27AAAAA1111A1Z1" className="tm-input font-mono text-sm" />
        </div>
        <div>
          <label className="tm-label">pan card *</label>
          <input
            type="text"
            value={app.onboardingData.pan}
            onChange={(e) => {
              const val = e.target.value.toUpperCase().slice(0, 10);
              app.updateOnboardingData({ pan: val });
              if (val && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val)) {
                app.setKycErrors(prev => ({ ...prev, pan: 'format: ABCDE1234F' }));
              } else {
                app.setKycErrors(prev => { const c = { ...prev }; delete c.pan; return c; });
              }
            }}
            placeholder="ABCDE1234F"
            className={`tm-input font-mono text-sm ${app.kycErrors.pan ? '!border-red-400' : ''}`}
          />
          {app.kycErrors.pan && <p className="text-xs font-bold text-red-500 mt-1">{app.kycErrors.pan}</p>}
        </div>

        <div>
          <label className="tm-label">business proof *</label>
          {!app.onboardingData.kycDoc && !app.uploadingFile ? (
            <div className="tm-card border-dashed border-2 border-white/10 p-6 text-center">
              <Plus className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">upload document</p>
              <div className="flex gap-2 justify-center mt-4">
                <button type="button" onClick={() => simulateUpload('shop_act_license.pdf (1.2MB)', 20)} className="px-4 py-2 bg-lime-400/10 rounded-full text-xs font-bold text-lime-400 hover:bg-brand-grassLight transition">PDF</button>
                <button type="button" onClick={() => simulateUpload('pan_card_scan.jpg (800KB)', 25)} className="px-4 py-2 bg-lime-400/10 rounded-full text-xs font-bold text-lime-400 hover:bg-brand-grassLight transition">JPG</button>
              </div>
            </div>
          ) : app.uploadingFile ? (
            <div className="tm-card p-4">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span>uploading...</span><span>{app.uploadProgress}%</span>
              </div>
              <div className="h-2 bg-lime-400/10 rounded-full overflow-hidden">
                <div className="h-full bg-brand-grassFresh transition-all" style={{ width: `${app.uploadProgress}%` }} />
              </div>
            </div>
          ) : (
            <div className="tm-card p-4 flex justify-between items-center bg-lime-400/10/40">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="font-bold text-sm text-white truncate max-w-[200px]">{app.onboardingData.kycDoc}</p>
                  <p className="text-[10px] font-bold text-lime-400">✓ uploaded</p>
                </div>
              </div>
              <button type="button" onClick={() => app.updateOnboardingData({ kycDoc: null })} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100"><X className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </div>
    </OnboardingShell>
  );
}
