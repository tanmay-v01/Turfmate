import { SendHorizontal, Plus } from 'lucide-react';
import { QUICK_REPLIES } from '../../data/chatData';

export default function ChatInputBar({
  chatType,
  inputText,
  setInputText,
  onSend,
  disabled = false,
}) {
  const quickReplies = QUICK_REPLIES[chatType] || QUICK_REPLIES.dm;

  const handleSend = () => {
    if (!inputText.trim() || disabled) return;
    onSend(inputText.trim());
    setInputText('');
  };

  return (
    <div className="tm-chat-input-bar">
      {!disabled && quickReplies.length > 0 && (
        <div className="tm-chat-quick-replies">
          {quickReplies.map((text) => (
            <button
              key={text}
              type="button"
              onClick={() => onSend(text)}
              className="tm-chat-quick-reply"
            >
              {text}
            </button>
          ))}
        </div>
      )}

      <div className="tm-chat-input-row">
        <button
          type="button"
          disabled={disabled}
          className="tm-chat-input-action"
          aria-label="Attach"
          onClick={() => {}}
        >
          <Plus className="w-5 h-5" />
        </button>
        <input
          type="text"
          placeholder={disabled ? 'Archived room' : 'Type a message…'}
          value={inputText}
          disabled={disabled}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="tm-chat-input"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !inputText.trim()}
          className="tm-chat-send"
          aria-label="Send message"
        >
          <SendHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
