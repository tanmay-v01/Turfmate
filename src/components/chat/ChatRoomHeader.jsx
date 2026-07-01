import { ChevronLeft, MapPin, Users, MoreVertical, Wallet } from 'lucide-react';
import { CHAT_TYPE_META } from '../../data/chatData';

export default function ChatRoomHeader({
  chat,
  onBack,
  onShowMembers,
  onOpenSplit,
  onOpenTurf,
  showBack = true,
  embedded = false,
}) {
  const typeMeta = CHAT_TYPE_META[chat.type];
  const meta = chat.meta || {};
  const subtitle =
    chat.type === 'game'
      ? `${meta.sport || 'Game'} · ${meta.gameTime || 'Scheduled'}`
      : chat.type === 'lobby'
        ? `${meta.area || 'Community'} · ${chat.members || 0} members`
        : chat.type === 'dm'
          ? meta.lastSeen || (meta.online ? 'Active now' : 'Offline')
          : typeMeta?.label;

  return (
    <>
      <header className="tm-chat-header">
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            className={`tm-chat-header__back ${embedded ? 'lg:hidden' : ''}`}
            aria-label="Back to inbox"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {chat.avatar ? (
          <img src={chat.avatar} alt="" className="tm-chat-header__avatar" />
        ) : (
          <div className={`tm-chat-header__avatar tm-chat-header__avatar--fallback ${typeMeta?.color || ''}`}>
            {chat.name?.[0]}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="tm-chat-header__title">{chat.name}</h3>
          <p className="tm-chat-header__subtitle truncate">
            {chat.type === 'dm' && meta.online && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 align-middle" />
            )}
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {chat.type === 'game' && chat.isActive !== false && onOpenSplit && (
            <button type="button" onClick={onOpenSplit} className="tm-chat-header__action" aria-label="Split hub">
              <Wallet className="w-4 h-4" />
            </button>
          )}
          {chat.type === 'game' && meta.turfId && onOpenTurf && (
            <button type="button" onClick={onOpenTurf} className="tm-chat-header__action" aria-label="View turf">
              <MapPin className="w-4 h-4" />
            </button>
          )}
          {(chat.type === 'game' || chat.type === 'lobby') && onShowMembers && (
            <button type="button" onClick={onShowMembers} className="tm-chat-header__action" aria-label="Members">
              <Users className="w-4 h-4" />
            </button>
          )}
          <button type="button" className="tm-chat-header__action" aria-label="More options">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </header>

      {chat.type === 'game' && chat.isActive !== false && meta.turfName && (
        <div className="tm-chat-game-banner">
          <div className="min-w-0 flex-1">
            <p className="tm-chat-game-banner__label">{meta.gameTime}</p>
            <p className="tm-chat-game-banner__title truncate">{meta.turfName} · {meta.sport}</p>
            {meta.spotsOpen > 0 && (
              <p className="tm-chat-game-banner__meta">{meta.spotsOpen} spots still open</p>
            )}
          </div>
          {meta.roster?.length > 0 && (
            <div className="flex -space-x-2 shrink-0">
              {meta.roster.slice(0, 4).map((name) => (
                <img
                  key={name}
                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`}
                  alt=""
                  className="w-7 h-7 rounded-full border-2 border-brand-forest object-cover bg-white/5"
                  title={name}
                />
              ))}
              {meta.roster.length > 4 && (
                <span className="w-7 h-7 rounded-full border-2 border-brand-forest bg-white/20 text-[9px] font-bold text-white flex items-center justify-center">
                  +{meta.roster.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
