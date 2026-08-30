import { describe, it, expect } from "vitest";
import { getCanvasThemeColors } from "./canvas-theme-colors";

describe("getCanvasThemeColors", () => {
  it("returns dark canvas colors when theme is 'dark'", () => {
    const colors = getCanvasThemeColors("dark");
    expect(colors.handleBackground).toBe("#1e1e1e");
    expect(colors.handleBorder).toBe("#4e4e4e");
    expect(colors.edgeStroke).toBe("#4e4e4e");
    expect(colors.edgeStrokeSelected).toBe("#747474");
    expect(colors.edgeMarkerSelected).toBe("#0052cc");
  });

  it("returns light canvas colors when theme is 'light'", () => {
    const colors = getCanvasThemeColors("light");
    expect(colors.handleBackground).toBe("#ffffff");
    expect(colors.handleBorder).toBe("#e5e7eb");
    expect(colors.edgeStroke).toBe("#9ca3af");
    expect(colors.edgeStrokeSelected).toBe("#6b7280");
    expect(colors.edgeMarkerSelected).toBe("#0052cc");
  });

  it("returns dark colors when theme is undefined (system default)", () => {
    const colors = getCanvasThemeColors(undefined);
    expect(colors.handleBackground).toBe("#1e1e1e");
    expect(colors.edgeStroke).toBe("#4e4e4e");
  });

  it("returns dark colors for unknown theme values", () => {
    const colors = getCanvasThemeColors("system");
    expect(colors.handleBackground).toBe("#1e1e1e");
  });

  it("light handle background matches canvas surface white", () => {
    const colors = getCanvasThemeColors("light");
    expect(colors.handleBackground).toBe("#ffffff");
  });

  it("dark handle background matches secondary-gray dark value", () => {
    const colors = getCanvasThemeColors("dark");
    expect(colors.handleBackground).toBe("#1e1e1e");
  });
});
