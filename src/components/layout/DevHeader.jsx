import { X, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function DevHeader() {
  const app = useApp();
  const role = app.userProfile?.role;
  const isOwner = role === 'OWNER' && app.userProfile?.approvalStatus === 'Approved';
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isPlayer = role === 'PLAYER' || (!isOwner && !isSuperAdmin && app.userProfile?.isLoggedIn);

  const goPlayer = () => {
    app.setIsAdminMode(false);
    app.setView('home');
  };

  const goOwner = () => {
    if (app.userProfile?.approvalStatus === 'Pending_Approval') {
      app.setView('owner_pending');
      return;
    }
    app.setIsAdminMode(false);
    const turfs = app.getOwnerTurfs();
    if (turfs.length) app.setOwnerActiveTurfId(turfs[0].id);
    app.setView('owner_dashboard');
  };

  const goSuperAdmin = () => {
    app.setIsAdminMode(false);
    app.setView('super_admin');
  };

  return (
    <>
      {app.whatsappNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[min(360px,92vw)] glass-grass p-4 rounded-[24px] shadow-premium z-[60] flex items-start gap-3 animate-pop">
          <div className="w-10 h-10 rounded-2xl bg-[#25D366] flex items-center justify-center text-lg shrink-0">💬</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xs text-brand-grassInk">WhatsApp</p>
            <p className="text-sm text-brand-forest mt-0.5">{app.whatsappNotification}</p>
          </div>
          <button onClick={() => app.setWhatsappNotification(null)} className="text-brand-muted hover:text-brand-forest">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="fixed top-4 right-4 z-[60] flex items-center gap-2">
        {app.userProfile?.isLoggedIn && (
          <div className="hidden sm:flex items-center gap-1 glass-grass p-1 rounded-full shadow-soft">
            <button
              onClick={goPlayer}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition ${isPlayer && app.view !== 'owner_dashboard' && app.view !== 'super_admin' ? 'bg-grass-btn text-brand-forestSoft shadow-pill' : 'text-brand-muted'}`}
            >
              player
            </button>
            {(isOwner || role === 'OWNER') && (
              <button
                onClick={goOwner}
                className={`px-3 py-1.5 text-xs font-bold rounded-full transition ${app.view === 'owner_dashboard' || app.view === 'owner_pending' ? 'bg-grass-btn text-brand-forestSoft shadow-pill' : 'text-brand-muted'}`}
              >
                owner
              </button>
            )}
            {(isSuperAdmin || role === 'SUPER_ADMIN') && (
              <button
                onClick={goSuperAdmin}
                className={`px-3 py-1.5 text-xs font-bold rounded-full transition ${app.view === 'super_admin' ? 'bg-grass-btn text-brand-forestSoft shadow-pill' : 'text-brand-muted'}`}
              >
                super
              </button>
            )}
          </div>
        )}

        <button
          onClick={app.resetApp}
          title="Reset demo"
          className="flex items-center gap-1.5 px-3 py-2 glass-grass rounded-full text-xs font-bold text-red-500 shadow-soft hover:scale-105 transition-transform"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          reset
        </button>
      </div>
    </>
  );
}
