import { describe, it, expect } from "vitest";
import { advanceBillingDate, calculatePeriodEnd } from "@/lib/billing/dates";

describe("Phase 4: Billing Date Advancement & Month-End Clamping", () => {
  it("clamps month-end dates accurately (e.g. 31 Jan -> 28 Feb non-leap year)", () => {
    // 31 Jan 2025 (non-leap year)
    const jan31 = new Date(2025, 0, 31);
    const feb = advanceBillingDate(jan31, "MONTHLY");

    expect(feb.getMonth()).toBe(1); // February
    expect(feb.getDate()).toBe(28); // Clamped to 28
  });

  it("clamps month-end dates to 29 Feb in leap years", () => {
    // 31 Jan 2024 (leap year)
    const jan31 = new Date(2024, 0, 31);
    const feb = advanceBillingDate(jan31, "MONTHLY");

    expect(feb.getMonth()).toBe(1); // February
    expect(feb.getDate()).toBe(29); // Clamped to 29
  });

  it("clamps 31 March to 30 April", () => {
    const mar31 = new Date(2026, 2, 31);
    const apr = advanceBillingDate(mar31, "MONTHLY");

    expect(apr.getMonth()).toBe(3); // April
    expect(apr.getDate()).toBe(30); // Clamped to 30
  });

  it("advances daily billing periods by exactly 1 day", () => {
    const start = new Date(2026, 9, 31); // 31 Oct
    const next = advanceBillingDate(start, "DAILY");

    expect(next.getDate()).toBe(1);
    expect(next.getMonth()).toBe(10); // Nov
  });

  it("advances weekly billing periods by exactly 7 days", () => {
    const start = new Date(2026, 9, 10);
    const next = advanceBillingDate(start, "WEEKLY");

    expect(next.getDate()).toBe(17);
  });

  it("calculates periodEnd right before the next cycle starts", () => {
    const start = new Date(2026, 0, 1, 0, 0, 0); // 1 Jan
    const end = calculatePeriodEnd(start, "MONTHLY");
    const next = advanceBillingDate(start, "MONTHLY"); // 1 Feb

    expect(end.getTime()).toBe(next.getTime() - 1000);
  });
});

