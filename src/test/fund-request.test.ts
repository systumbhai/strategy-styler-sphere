import { describe, expect, it } from "vitest";
import { createFundRequest, fundRequestAutoCompleted, fundRequestExpired, validFundAmount } from "@/lib/fund-request";

describe("Reference fund requests", () => {
  it("expires exactly five minutes after creation", () => {
    const request = createFundRequest(5000, 1000);
    expect(request.expiresAt).toBe(301000);
    expect(fundRequestExpired(request.expiresAt, 300999)).toBe(false);
    expect(fundRequestExpired(request.expiresAt, 301000)).toBe(true);
  });
  it("accepts amounts from 40 through 97185", () => {
    expect(validFundAmount(39.99)).toBe(false);
    expect(validFundAmount(40)).toBe(true);
    expect(validFundAmount(97185)).toBe(true);
    expect(validFundAmount(97185.01)).toBe(false);
    expect(validFundAmount(NaN)).toBe(false);
  });
  it("completes the payment 10 seconds after the QR appears", () => {
    const request = createFundRequest(5000, 1000);
    expect(fundRequestAutoCompleted(request, 10999)).toBe(false);
    expect(fundRequestAutoCompleted(request, 11000)).toBe(true);
  });
});