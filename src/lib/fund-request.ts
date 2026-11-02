export const FUND_MIN = 40;
export const FUND_MAX = 97185;
export const FUND_REQUEST_DURATION = 5 * 60 * 1000;
/** Demo payment confirms automatically this long after the QR appears. */
export const FUND_AUTO_COMPLETE_MS = 10 * 1000;

export function validFundAmount(amount: number) {
  return Number.isFinite(amount) && amount >= FUND_MIN && amount <= FUND_MAX;
}

export function createFundRequest(amount: number, now: number) {
  if (!validFundAmount(amount)) throw new Error("Amount outside the supported range");
  return { amount, createdAt: now, expiresAt: now + FUND_REQUEST_DURATION };
}

export function fundRequestExpired(expiresAt: number, now: number) {
  return now >= expiresAt;
}

export function fundRequestAutoCompleted(request: { createdAt: number; expiresAt: number }, now: number) {
  return !fundRequestExpired(request.expiresAt, now) && now >= request.createdAt + FUND_AUTO_COMPLETE_MS;
}

export function fundTransactionId(now: number) {
  return `T${now.toString().slice(-10)}${Math.floor(Math.random() * 9000 + 1000)}`;
}
