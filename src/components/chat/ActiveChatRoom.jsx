import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import ChatRoomHeader from './ChatRoomHeader';
import ChatMessageList from './ChatMessageList';
import ChatInputBar from './ChatInputBar';
import ChatMembersPanel from './ChatMembersPanel';

export default function ActiveChatRoom({ chat, onBack, embedded = false }) {
  const app = useApp();
  const liveChat = app.chats.find((c) => c.id === chat.id) || chat;
  const [inputText, setInputText] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [typingHint, setTypingHint] = useState(false);
  const messagesEndRef = useRef(null);

  const readOnly = liveChat.type === 'game' && liveChat.isActive === false;
  const inputType = liveChat.type === 'lobby' ? 'lobby' : liveChat.type === 'game' ? 'game' : 'dm';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveChat.messages?.length]);

  useEffect(() => {
    if (readOnly) return;
    setTypingHint(true);
    const t = setTimeout(() => setTypingHint(false), 2500);
    return () => clearTimeout(t);
  }, [liveChat.id, readOnly]);

  const handleSend = (text) => {
    if (readOnly) return;
    app.sendMessage(liveChat.id, text, 'TEXT');
  };

  return (
    <div className={`tm-chat-room ${embedded ? 'tm-chat-room--embedded' : ''}`}>
      <ChatRoomHeader
        chat={liveChat}
        onBack={onBack}
        showBack
        embedded={embedded}
        onShowMembers={() => setShowMembers(true)}
        onOpenSplit={() => app.setView('split_hub')}
        onOpenTurf={() => {
          if (liveChat.meta?.turfId) {
            app.setActiveTurfId(liveChat.meta.turfId);
            app.setView('turf_details');
          }
        }}
      />

      <ChatMessageList
        chat={liveChat}
        userProfile={app.userProfile}
        messagesEndRef={messagesEndRef}
      />

      {typingHint && !readOnly && liveChat.type !== 'dm' && (
        <p className="tm-chat-typing">Someone is typing…</p>
      )}

      <ChatInputBar
        chatType={inputType}
        inputText={inputText}
        setInputText={setInputText}
        onSend={handleSend}
        disabled={readOnly}
      />

      {showMembers && (
        <ChatMembersPanel
          chat={liveChat}
          currentUserName={app.userProfile.name}
          onClose={() => setShowMembers(false)}
        />
      )}
    </div>
  );
}
