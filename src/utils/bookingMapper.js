const STATUS_LABELS = {
  CONFIRMED: 'Confirmed',
  PENDING_FUNDING: 'Confirmed (Split Active)',
  CANCELLED_BY_HOST: 'Cancelled',
  CANCELLED_BY_SYSTEM: 'Refunded (Split Failed)',
  CANCELLED_BY_OWNER: 'Cancelled',
};

export function parseSlotKey(slotKey) {
  if (!slotKey) return { slotId: null, dateLabel: 'Today' };
  const parts = slotKey.split(':');
  return {
    slotId: parts[1] || null,
    dateLabel: parts[2] || 'Today',
  };
}

export function resolveSlotTime(turfs, turfId, slotId) {
  const turf = turfs.find((t) => t.id === turfId);
  const slot = turf?.slots?.find((s) => s.id === slotId);
  return slot?.time || slotId || '—';
}

export function mapApiBooking(row, turfs = []) {
  const { slotId, dateLabel } = parseSlotKey(row.slot_key);
  const turfId = row.turf_legacy_id || row.turf_id;
  const turfName = row.turf_name || 'Turf booking';
  const type = row.booking_type === 'SPLIT_PAY' ? 'split' : 'private';

  return {
    id: row.id,
    turfId,
    turfName,
    slotTime: resolveSlotTime(turfs, turfId, slotId),
    date: dateLabel,
    type,
    paidAmount: row.total_cost,
    totalAmount: row.total_cost,
    status: STATUS_LABELS[row.status] || row.status,
    qrCode: `TMT-${type.toUpperCase()}-${row.id}-${turfName.slice(0, 3).toUpperCase()}`,
    roster: [],
    source: 'api',
    bookedAt: row.created_at,
  };
}
