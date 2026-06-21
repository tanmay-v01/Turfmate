import { CHAT_TYPE_META } from '../../data/chatData';
import { getChatPreview, getLastMessage } from '../../utils/chatHelpers';

const TYPE_BADGE = {
  game: { label: 'game', className: 'tm-chat-badge--game' },
  lobby: { label: 'lobby', className: 'tm-chat-badge--lobby' },
  dm: { label: 'dm', className: 'tm-chat-badge--dm' },
};

export default function ChatInboxRow({ chat, userProfile, active, onClick }) {
  const last = getLastMessage(chat);
  const preview = getChatPreview(chat, userProfile);
  const unread = chat.unread || 0;
  const badge = TYPE_BADGE[chat.type];
  const typeMeta = CHAT_TYPE_META[chat.type];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`tm-chat-inbox-row ${active ? 'tm-chat-inbox-row--active' : ''}`}
    >
      <div className="relative shrink-0">
        {chat.avatar ? (
          <img src={chat.avatar} alt="" className="tm-chat-inbox-row__avatar" />
        ) : (
          <div className={`tm-chat-inbox-row__avatar tm-chat-inbox-row__avatar--fallback ${typeMeta?.color || ''}`}>
            {chat.name?.[0]}
          </div>
        )}
        {chat.type === 'dm' && chat.meta?.online && (
          <span className="tm-chat-inbox-row__online" aria-label="Online" />
        )}
        {chat.type === 'game' && chat.isActive === false && (
          <span className="tm-chat-inbox-row__archived" aria-label="Archived">arch</span>
        )}
      </div>

      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className={`tm-chat-inbox-row__name truncate ${unread ? 'tm-chat-inbox-row__name--unread' : ''}`}>
            {chat.name}
          </p>
          <span className="tm-chat-inbox-row__time shrink-0">{last?.time || ''}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {badge && (
            <span className={`tm-chat-badge ${badge.className}`}>{badge.label}</span>
          )}
          <p className={`tm-chat-inbox-row__preview truncate flex-1 ${unread ? 'tm-chat-inbox-row__preview--unread' : ''}`}>
            {preview}
          </p>
        </div>
        {chat.type === 'lobby' && chat.members && (
          <p className="tm-chat-inbox-row__meta">{chat.members} members</p>
        )}
      </div>

      {unread > 0 && (
        <span className="tm-chat-inbox-row__unread">{unread > 9 ? '9+' : unread}</span>
      )}
    </button>
  );
}
