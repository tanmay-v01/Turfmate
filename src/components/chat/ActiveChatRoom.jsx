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
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const messagesEndRef = useRef(null);

  const readOnly = liveChat.type === 'game' && liveChat.isActive === false;
  const inputType = liveChat.type === 'lobby' ? 'lobby' : liveChat.type === 'game' ? 'game' : 'dm';
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveChat.messages?.length]);

  useEffect(() => {
    let active = true;
    if (chat.id && !chat.id.startsWith('chat-fallback')) {
      const { chatApi } = require('../../services/chatApi');
      chatApi.getRoomHistory(chat.id).then(({ messages = [] }) => {
        if (active) {
          app.setChats(prev => prev.map(c => {
            if (c.id === chat.id) {
              return { ...c, messages: messages };
            }
            return c;
          }));
          setHasMore(messages.length === 50);
        }
      }).catch(err => console.warn('Failed to fetch chat history', err));
    }
    return () => { active = false; };
  }, [chat.id]);

  useEffect(() => {
    if (readOnly) return;
    const { socketService } = require('../../services/socket');
    
    const handleTyping = ({ roomId, userName }) => {
      if (roomId === chat.id) {
        setTypingHint(`${userName} is typing…`);
      }
    };
    
    const handleStopTyping = ({ roomId }) => {
      if (roomId === chat.id) {
        setTypingHint(false);
      }
    };

    socketService.onTyping(handleTyping);
    socketService.onStopTyping(handleStopTyping);
  }, [chat.id, readOnly]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || !liveChat.messages?.length) return;
    setLoadingMore(true);
    try {
      const oldestMsg = liveChat.messages[0];
      const { chatApi } = require('../../services/chatApi');
      const { messages } = await chatApi.getRoomHistory(chat.id, oldestMsg.id);
      
      if (messages.length < 50) setHasMore(false);
      
      if (messages.length > 0) {
        app.setChats(prev => prev.map(c => {
          if (c.id === chat.id) {
            return { ...c, messages: [...messages, ...c.messages] };
          }
          return c;
        }));
      }
    } catch (err) {
      console.error('Failed to load older messages', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSend = (text) => {
    if (readOnly) return;
    app.sendMessage(liveChat.id, text, 'TEXT');
  };

  const handleInputTyping = (isTyping) => {
    if (readOnly) return;
    const { socketService } = require('../../services/socket');
    socketService.sendTyping(chat.id, app.userProfile.name || 'Player', isTyping);
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
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      />

      {typingHint && !readOnly && liveChat.type !== 'dm' && (
        <p className="tm-chat-typing">{typingHint}</p>
      )}

      <ChatInputBar
        chatType={inputType}
        inputText={inputText}
        setInputText={setInputText}
        onSend={handleSend}
        onTyping={handleInputTyping}
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
