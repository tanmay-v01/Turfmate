export function isOwnMessage(msg, userProfile) {
  if (!msg) return false;
  const me = userProfile?.name || 'You';
  return (
    msg.sender === 'You' ||
    msg.sender === me ||
    msg.sender === userProfile?.username
  );
}

export function isSystemMessage(msg) {
  return msg?.type === 'SYSTEM_ALERT' || msg?.sender === 'System';
}

export function getLastMessage(chat) {
  const msgs = chat?.messages || [];
  return msgs[msgs.length - 1] || null;
}

export function getChatPreview(chat, userProfile) {
  const last = getLastMessage(chat);
  if (!last) return 'No messages yet';
  if (isSystemMessage(last)) return last.text;
  const prefix = isOwnMessage(last, userProfile) ? 'You: ' : '';
  return `${prefix}${last.text}`;
}

export function groupMessagesWithDates(messages) {
  if (!messages?.length) return [];

  const groups = [];
  let currentDate = null;
  let currentSender = null;
  let batch = [];

  const flushBatch = () => {
    if (batch.length) {
      groups.push({ type: 'batch', sender: currentSender, messages: batch });
      batch = [];
    }
  };

  messages.forEach((msg, index) => {
    if (isSystemMessage(msg)) {
      flushBatch();
      currentSender = null;
      groups.push({ type: 'system', message: msg, key: `sys-${index}` });
      return;
    }

    const dateLabel = msg.dateLabel || 'Today';
    if (dateLabel !== currentDate) {
      flushBatch();
      currentSender = null;
      currentDate = dateLabel;
      groups.push({ type: 'date', label: dateLabel, key: `date-${dateLabel}-${index}` });
    }

    const sender = msg.sender;
    if (sender !== currentSender) {
      flushBatch();
      currentSender = sender;
    }
    batch.push({ ...msg, key: msg.id || `msg-${index}` });
  });

  flushBatch();
  return groups;
}

export function filterChats(chats, query) {
  const q = query.trim().toLowerCase();
  if (!q) return chats;
  return chats.filter(
    (c) =>
      c.name?.toLowerCase().includes(q) ||
      c.messages?.some((m) => m.text?.toLowerCase().includes(q))
  );
}

export function countUnreadByType(chats, type) {
  return chats
    .filter((c) => c.type === type)
    .reduce((sum, c) => sum + (c.unread || 0), 0);
}
