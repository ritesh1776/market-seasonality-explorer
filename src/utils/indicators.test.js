import { describe, it, expect } from "vitest";
import { calculateSMA, calculateRSI } from "./indicators";

describe("calculateSMA", () => {
  it("should calculate the simple moving average correctly", () => {
    const sampleData = [
      { close: 10 },
      { close: 12 },
      { close: 14 },
      { close: 11 },
      { close: 13 },
    ];
    const period = 5;
    const result = calculateSMA(sampleData, period);
    expect(result).toBe("12.00");
  });

  it("should return null if data is insufficient", () => {
    const sampleData = [{ close: 10 }, { close: 12 }];
    const period = 5;
    const result = calculateSMA(sampleData, period);
    expect(result).toBeNull();
  });
});

describe("calculateRSI", () => {
  it("should calculate the relative strength index correctly", () => {
    // Arrange: 14 periods of data changes
    const sampleData = [
      { close: 100 },
      { close: 102 },
      { close: 104 },
      { close: 106 },
      { close: 108 },
      { close: 110 },
      { close: 112 },
      { close: 111 },
      { close: 110 },
      { close: 109 },
      { close: 108 },
      { close: 107 },
      { close: 106 },
      { close: 105 },
      { close: 105 },
    ];
    // Total Gain = 12, Total Loss = 7.
    // Avg Gain = 12/14, Avg Loss = 7/14.
    // RS = (12/14) / (7/14) = 1.714
    // RSI = 100 - (100 / 2.714) = 63.16

    // Act
    const result = calculateRSI(sampleData);

    // Assert
    expect(result).toBe("63.16"); // Corrected the expected value
  });

  it("should return null if data is insufficient", () => {
    const sampleData = [{ close: 100 }, { close: 101 }];
    const result = calculateRSI(sampleData);
    expect(result).toBeNull();
  });
});
