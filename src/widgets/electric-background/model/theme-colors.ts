export interface ThemeColors {
  background: string;
  gridStroke: string;
  nodeColor: string;
  lightningColor: string;
}

const DARK_COLORS: ThemeColors = {
  background: "#0f0f0f",
  gridStroke: "rgba(54, 54, 54, 0.25)",
  nodeColor: "#0052cc",
  lightningColor: "rgba(0, 82, 204,",
};

const LIGHT_COLORS: ThemeColors = {
  background: "#f9fafb",
  gridStroke: "rgba(229, 231, 235, 0.7)",
  nodeColor: "#0052cc",
  lightningColor: "rgba(0, 82, 204,",
};

export function getThemeColors(theme: string | undefined): ThemeColors {
  if (theme === "light") {
    return LIGHT_COLORS;
  }
  return DARK_COLORS;
}
