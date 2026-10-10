export const FUND_MIN = 40;
export const FUND_MAX = 97185;
export const FUND_REQUEST_DURATION = 5 * 60 * 1000;

export function validFundAmount(amount: number) {
  return Number.isFinite(amount) && amount >= FUND_MIN && amount <= FUND_MAX;
}

export function createFundRequest(amount: number, now: number) {
  if (!validFundAmount(amount)) throw new Error("Amount outside the supported range");
  return { amount, expiresAt: now + FUND_REQUEST_DURATION };
}

export function fundRequestExpired(expiresAt: number, now: number) {
  return now >= expiresAt;
}