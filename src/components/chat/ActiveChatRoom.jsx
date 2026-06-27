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

  const [decryptedMessages, setDecryptedMessages] = useState([]);
  
  // Load room keys and decrypt history
  useEffect(() => {
    let active = true;
    if (chat.id && !chat.id.startsWith('chat-fallback')) {
      const loadHistory = async () => {
        try {
          const { chatApi } = await import('../../services/chatApi');
          const { cryptoService, cryptoCache } = await import('../../services/cryptoService');
          
          let aesKey = cryptoCache.roomKeys.get(chat.id);
          
          if (!readOnly && !aesKey) {
            const privJwkStr = localStorage.getItem('tm_chat_privkey');
            if (privJwkStr) {
              const privKey = await cryptoService.importPrivateKey(privJwkStr);
              const keyData = await chatApi.getRoomKeys(chat.id);
              
              if (keyData.encryptedKey) {
                // Decrypt room key
                const rawBase64 = await cryptoService.decryptRoomKey(keyData.encryptedKey, privKey);
                aesKey = await cryptoService.importRoomKey(rawBase64);
                cryptoCache.roomKeys.set(chat.id, aesKey);
              } else if (keyData.members && keyData.members.length > 0) {
                // Generate room key
                aesKey = await cryptoService.generateRoomKey();
                const rawBase64 = await cryptoService.exportRoomKey(aesKey);
                
                // Encrypt for all members
                const uploadKeys = {};
                for (const m of keyData.members) {
                  if (m.publicKey) {
                    const pub = await cryptoService.importPublicKey(m.publicKey);
                    uploadKeys[m.userId] = await cryptoService.encryptRoomKey(rawBase64, pub);
                  }
                }
                if (Object.keys(uploadKeys).length > 0) {
                  await chatApi.saveRoomKeys(chat.id, uploadKeys);
                  cryptoCache.roomKeys.set(chat.id, aesKey);
                }
              }
            }
          }

          const { messages = [] } = await chatApi.getRoomHistory(chat.id);
          if (!active) return;
          
          app.setChats(prev => prev.map(c => {
            if (c.id === chat.id) return { ...c, messages };
            return c;
          }));
          setHasMore(messages.length === 50);
        } catch (err) {
          console.warn('Failed to load chat history or keys', err);
        }
      };
      loadHistory();
    }
    return () => { active = false; };
  }, [chat.id, readOnly]);

  // Decrypt live messages
  useEffect(() => {
    let active = true;
    const decryptAll = async () => {
      const { cryptoService, cryptoCache } = await import('../../services/cryptoService');
      const aesKey = cryptoCache.roomKeys.get(chat.id);
      
      const decrypted = [];
      for (const msg of (liveChat.messages || [])) {
        if (aesKey && msg.text.startsWith('E2EE|')) {
          const [, ivBase64, ciphertext] = msg.text.split('|');
          const plain = await cryptoService.decryptMessage(ciphertext, ivBase64, aesKey);
          decrypted.push({ ...msg, text: plain });
        } else {
          decrypted.push(msg); // fallback for plaintext or un-decryptable
        }
      }
      if (active) setDecryptedMessages(decrypted);
    };
    decryptAll();
    return () => { active = false; };
  }, [liveChat.messages, chat.id]);

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

  const handleSend = async (text) => {
    if (readOnly) return;
    
    let outText = text;
    try {
      const { cryptoService, cryptoCache } = await import('../../services/cryptoService');
      const aesKey = cryptoCache.roomKeys.get(chat.id);
      if (aesKey) {
        const { ciphertext, iv } = await cryptoService.encryptMessage(text, aesKey);
        outText = `E2EE|${iv}|${ciphertext}`;
      }
    } catch (err) {
      console.error('Encryption failed', err);
    }
    
    app.sendMessage(liveChat.id, outText, 'TEXT');
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
        chat={{ ...liveChat, messages: decryptedMessages.length > 0 || !liveChat.messages?.length ? decryptedMessages : liveChat.messages }}
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
