import { groupMessagesWithDates, isOwnMessage } from '../../utils/chatHelpers';

function MessageBubble({ msg, own, showSender, chat }) {
  return (
    <div className={`flex flex-col ${own ? 'items-end' : 'items-start'}`}>
      {!own && showSender && (
        <span className="tm-chat-msg__sender">{msg.sender}</span>
      )}
      <div className={`tm-chat-bubble ${own ? 'tm-chat-bubble--own' : 'tm-chat-bubble--other'}`}>
        <p className="tm-chat-bubble__text">{msg.text}</p>
        <span className={`tm-chat-bubble__time ${own ? 'tm-chat-bubble__time--own' : ''}`}>
          {msg.time}
          {own && chat.type === 'dm' && (
            <span className="tm-chat-bubble__read" aria-label="Sent"> ✓</span>
          )}
        </span>
      </div>
    </div>
  );
}

export default function ChatMessageList({ chat, userProfile, messagesEndRef, onLoadMore, hasMore }) {
  const groups = groupMessagesWithDates(chat.messages || []);

  return (
    <div className="tm-chat-messages">
      {chat.type === 'game' && chat.isActive !== false && (
        <div className="tm-chat-notice">
          <span>Game chat archives 12 hours after the match ends.</span>
        </div>
      )}
      {chat.type === 'game' && chat.isActive === false && (
        <div className="tm-chat-notice tm-chat-notice--muted">
          <span>This room is archived — read only.</span>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center my-2">
          <button 
            onClick={onLoadMore} 
            className="text-xs text-brand-forest font-bold bg-brand-forest/10 px-3 py-1.5 rounded-full hover:bg-brand-forest/20 transition-colors"
          >
            Load older messages
          </button>
        </div>
      )}

      {groups.map((group) => {
        if (group.type === 'date') {
          return (
            <div key={group.key} className="tm-chat-date">
              <span>{group.label}</span>
            </div>
          );
        }
        if (group.type === 'system') {
          return (
            <div key={group.key} className="tm-chat-system">
              <span>{group.message.text}</span>
            </div>
          );
        }
        return (
          <div key={`batch-${group.messages[0]?.key}`} className="space-y-1">
            {group.messages.map((msg, idx) => (
              <MessageBubble
                key={msg.key}
                msg={msg}
                own={isOwnMessage(msg, userProfile)}
                showSender={idx === 0 && chat.type !== 'dm'}
                chat={chat}
              />
            ))}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
