/**
 * Theme-aware color palette for canvas/diagram components.
 * Canvas elements use inline styles with hex values — CSS variables don't work there.
 * This utility maps theme → hex values for use in JS draw calls and inline styles.
 */

export interface CanvasThemeColors {
  /** Node handle background color */
  handleBackground: string;
  /** Node handle border color */
  handleBorder: string;
  /** Edge default stroke color */
  edgeStroke: string;
  /** Edge selected stroke color */
  edgeStrokeSelected: string;
  /** Edge marker color when selected */
  edgeMarkerSelected: string;
}

const DARK_CANVAS_COLORS: CanvasThemeColors = {
  handleBackground: "#1e1e1e",
  handleBorder: "#4e4e4e",
  edgeStroke: "#4e4e4e",
  edgeStrokeSelected: "#747474",
  edgeMarkerSelected: "#0052cc",
};

const LIGHT_CANVAS_COLORS: CanvasThemeColors = {
  handleBackground: "#ffffff",
  handleBorder: "#e5e7eb",
  edgeStroke: "#9ca3af",
  edgeStrokeSelected: "#6b7280",
  edgeMarkerSelected: "#0052cc",
};

export function getCanvasThemeColors(theme: string | undefined): CanvasThemeColors {
  if (theme === "light") {
    return LIGHT_CANVAS_COLORS;
  }
  return DARK_CANVAS_COLORS;
}
