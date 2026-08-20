import { describe, it, expect } from "vitest";
import { getThemeColors } from "./theme-colors";

describe("getThemeColors", () => {
  it("returns dark colors when theme is 'dark'", () => {
    const colors = getThemeColors("dark");
    expect(colors.background).toBe("#0f0f0f");
    expect(colors.gridStroke).toBe("rgba(54, 54, 54, 0.25)");
    expect(colors.nodeColor).toBe("#0052cc");
    expect(colors.lightningColor).toBe("rgba(0, 82, 204,");
  });

  it("returns light colors when theme is 'light'", () => {
    const colors = getThemeColors("light");
    expect(colors.background).toBe("#fafaf9");
    expect(colors.gridStroke).toBe("rgba(168, 162, 158, 0.2)");
    expect(colors.nodeColor).toBe("#0052cc");
    expect(colors.lightningColor).toBe("rgba(0, 82, 204,");
  });

  it("returns dark colors when theme is undefined (system default)", () => {
    const colors = getThemeColors(undefined);
    expect(colors.background).toBe("#0f0f0f");
  });

  it("returns dark colors for unknown theme values", () => {
    const colors = getThemeColors("system");
    expect(colors.background).toBe("#0f0f0f");
  });
});
