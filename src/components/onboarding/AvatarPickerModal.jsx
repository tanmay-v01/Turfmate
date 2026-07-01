import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import AvatarPicker from './AvatarPicker';

export default function AvatarPickerModal() {
  const app = useApp();
  if (!app.showAvatarPicker) return null;

  const handleSave = (url) => {
    app.updateUserAvatar(url);
    app.setShowAvatarPicker(false);
    app.showToast('Avatar updated', 'success');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-brand-forest/40 backdrop-blur-sm" onClick={() => app.setShowAvatarPicker(false)} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-[28px] shadow-premium border border-slate-100 p-5 sm:p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-display font-extrabold text-lg text-brand-forest lowercase">choose avatar</h3>
            <p className="text-xs text-slate-400 mt-0.5">pick a style — squads see this on the map & leaderboard</p>
          </div>
          <button onClick={() => app.setShowAvatarPicker(false)} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center mb-4">
          <img
            src={app.userProfile.avatar}
            alt=""
            className="w-20 h-20 rounded-[24px] border-4 border-brand-grassFresh/50 bg-brand-grassPale shadow-soft object-cover"
          />
        </div>

        <AvatarPicker value={app.userProfile.avatar} onChange={handleSave} compact />

        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
          <button 
            onClick={() => {
              app.setShowAvatarPicker(false);
              app.resetApp();
            }}
            className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
