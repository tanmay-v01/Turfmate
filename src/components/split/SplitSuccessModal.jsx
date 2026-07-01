import { Trophy, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { splitChatId } from '../../utils/chatMapper';

export default function SplitSuccessModal() {
  const app = useApp();

  if (!app.showSplitSuccessModal) return null;

  const ann = app.announcements.find((a) => a.id === app.splitSuccessAnnId);
  const chatId = splitChatId(ann);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-brand-forest/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-[32px] p-8 text-center shadow-premium animate-slide-up space-y-5">
        <div className="w-20 h-20 tm-icon-accent-green rounded-full flex items-center justify-center mx-auto">
          <Trophy className="w-10 h-10" />
        </div>
        <div>
          <h2 className="font-display font-extrabold text-2xl text-slate-800 lowercase">game on!</h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            The split is fully funded. The turf is officially booked.
          </p>
          {ann && (
            <p className="text-xs text-slate-400 mt-1 font-bold">{ann.turfName} · {ann.time}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              app.setShowSplitSuccessModal(false);
              if (chatId) {
                app.setActiveChatId(chatId);
                app.setView('chat');
              } else {
                app.setView('locker_room');
              }
            }}
            className="w-full py-3.5 tm-btn-primary rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" /> go to game chat
          </button>
          <button
            type="button"
            onClick={() => {
              app.setShowSplitSuccessModal(false);
              app.setView('split_hub');
            }}
            className="w-full py-3 text-slate-500 font-bold text-sm hover:text-slate-800 transition"
          >
            view split hub
          </button>
        </div>
      </div>
    </div>
  );
}
