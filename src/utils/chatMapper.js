export function splitChatId(ann) {
  if (!ann) return null;
  if (ann.bookingId && !String(ann.bookingId).startsWith('B-')) {
    return `chat-booking-${ann.bookingId}`;
  }
  return `chat-ann-${ann.id}`;
}

export function mapApiChatRoom(room) {
  return {
    id: room.id,
    name: room.name,
    type: room.type || 'game',
    unread: room.unread || 0,
    isActive: room.isActive !== false,
    meta: room.meta || {},
    messages: room.messages || [],
    bookingId: room.bookingId,
    source: 'api',
  };
}

export function mergeChats(apiRooms, prev = []) {
  const localOnly = prev.filter((c) => c.source !== 'api' && !String(c.id).startsWith('chat-booking-'));
  const apiIds = new Set((apiRooms || []).map((r) => r.id));
  const keptLocal = localOnly.filter((c) => !apiIds.has(c.id));
  return [...(apiRooms || []), ...keptLocal];
}
