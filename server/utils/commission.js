/** Commission helpers — keep in sync with src/constants/commission.js */

const COMMISSION_RATE = 0.1;

function calcCommission(amountInr) {
  return Math.floor(Number(amountInr) * COMMISSION_RATE);
}

function calcOwnerNet(grossInr) {
  const commission = calcCommission(grossInr);
  return { commission, net: grossInr - commission };
}

module.exports = { COMMISSION_RATE, calcCommission, calcOwnerNet };
