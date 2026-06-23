export function mapLockerPost(row) {
  const extra = row.extra || {};
  const isHighlight = row.contentType === 'HIGHLIGHT' || extra.isHighlight;
  const category = row.contentType || 'LFG';

  return {
    id: row.id || `post-${row.postId}`,
    postId: row.postId,
    hostId: row.hostId || row.authorId,
    hostName: row.hostName || 'Player',
    hostAvatar: row.hostAvatar || '',
    hostLevel: row.hostLevel || 'Intermediate',
    sport: extra.sport || 'general',
    sportLabel: isHighlight ? 'Match Highlight' : category,
    sportIcon: isHighlight ? '📸' : category === 'LFG' ? '👋' : category.includes('GEAR') ? '🎒' : '💬',
    turfId: extra.turfId || 'turf-1',
    turfName: extra.turfName || 'Nearby',
    distance: extra.distance || '0.5 km',
    time: 'Just now',
    costPerHead: 0,
    playersNeeded: 0,
    totalSpots: 0,
    roster: extra.roster || [],
    status: category === 'LFG' ? 'lfg' : 'open',
    text: row.contentText,
    isHighlight,
    highlightScore: extra.highlightScore || null,
    turfImage: extra.turfImage,
    source: 'api',
    createdAt: row.createdAt,
    expiresAt: row.expiresAt,
  };
}

export function mergeLockerAnnouncements(apiSplits, apiPosts, prev = [], apiBroadcasts = []) {
  const demoOnly = prev.filter((a) => {
    if (a.source === 'api' || a.source === 'broadcast' || a.postId || a.broadcastId) return false;
    if (a.bookingId && !String(a.bookingId).startsWith('B-')) return false;
    return true;
  });
  const apiBookingIds = new Set((apiSplits || []).map((s) => s.bookingId).filter(Boolean));
  const keptDemo = demoOnly.filter((d) => !d.bookingId || !apiBookingIds.has(d.bookingId));
  return [...(apiBroadcasts || []), ...(apiSplits || []), ...(apiPosts || []), ...keptDemo];
}
