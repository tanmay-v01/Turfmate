/** TurfMate takes 10% commission on every in-app booking */
export const COMMISSION_RATE = 0.1;

export function calcCommission(grossAmount) {
  return Math.round(grossAmount * COMMISSION_RATE);
}

export function calcOwnerNet(grossAmount) {
  return grossAmount - calcCommission(grossAmount);
}

export function enrichBookingPayment(baseBooking, turf, collectedAmount, totalSlotPrice = null) {
  const commissionAmount = calcCommission(collectedAmount);
  return {
    ...baseBooking,
    ownerId: turf?.ownerId || null,
    grossAmount: totalSlotPrice ?? collectedAmount,
    collectedAmount,
    commissionAmount,
    ownerPayout: collectedAmount - commissionAmount,
    source: 'app',
    bookedAt: new Date().toISOString(),
  };
}
