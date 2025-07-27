import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getWeeksForCurrentYear,
  getMonthsForCurrentYear,
  getYearsRange,
} from "./dateHelpers";

// This ensures our date mock is reset after each test
afterEach(() => {
  vi.useRealTimers();
});

describe("dateHelpers", () => {
  it("should generate the correct list of weeks", () => {
    // Arrange: We pretend today is July 27, 2025 (the 31st week)
    vi.setSystemTime(new Date("2025-07-27"));

    // Act
    const weeks = getWeeksForCurrentYear();

    // Assert
    expect(weeks.length).toBe(31); // Corrected expectation
    expect(weeks[0]).toBe(1);
    expect(weeks[30]).toBe(31); // Corrected expectation
  });

  it("should generate the correct list of months", () => {
    // Arrange: We pretend today is March 15, 2024
    vi.setSystemTime(new Date("2024-03-15"));

    // Act
    const months = getMonthsForCurrentYear();

    // Assert
    expect(months.length).toBe(3); // Jan, Feb, Mar
    expect(months[0]).toBe("January");
    expect(months[2]).toBe("March");
  });

  it("should generate the correct range of years", () => {
    // Arrange: We pretend today is in the year 2026
    vi.setSystemTime(new Date("2026-01-01"));

    // Act
    const years = getYearsRange(2020); // Test with a different start year

    // Assert
    expect(years.length).toBe(7); // 2020, 21, 22, 23, 24, 25, 26
    expect(years[0]).toBe(2026); // The list is reversed
    expect(years[6]).toBe(2020);
  });
});
