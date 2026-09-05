export const DECORATION_STYLES = ["soft", "mesh", "dots", "waves", "none"] as const;
export type DecorationStyle = (typeof DECORATION_STYLES)[number];

export type ThemePreset = {
  id: string;
  accentColor: string;
  backgroundColor: string;
  decoration: DecorationStyle;
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "teal",
    accentColor: "#0d6e6e",
    backgroundColor: "#eef2f4",
    decoration: "soft",
  },
  {
    id: "ocean",
    accentColor: "#1d6fbf",
    backgroundColor: "#eef3f8",
    decoration: "waves",
  },
  {
    id: "forest",
    accentColor: "#2f6b3c",
    backgroundColor: "#eef3ee",
    decoration: "mesh",
  },
  {
    id: "sunset",
    accentColor: "#b85a2a",
    backgroundColor: "#f6efe8",
    decoration: "soft",
  },
  {
    id: "rose",
    accentColor: "#9b3d5a",
    backgroundColor: "#f7eef1",
    decoration: "dots",
  },
  {
    id: "ink",
    accentColor: "#243447",
    backgroundColor: "#eef1f4",
    decoration: "none",
  },
];

function clamp(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

export function normalizeHex(value: string | undefined | null, fallback: string): string {
  const raw = String(value || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toLowerCase();
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toLowerCase()}`;
  return fallback;
}

export function normalizeDecoration(
  value: string | undefined | null,
): DecorationStyle {
  if (DECORATION_STYLES.includes(value as DecorationStyle)) {
    return value as DecorationStyle;
  }
  return "soft";
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = normalizeHex(hex, "#0d6e6e").slice(1);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function darkenHex(hex: string, amount = 0.18): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = 1 - amount;
  return `#${[r, g, b]
    .map((c) => clamp(c * factor).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function mixHex(hex: string, withColor: string, weight = 0.15): string {
  const a = hexToRgb(hex);
  const b = hexToRgb(withColor);
  const w = Math.max(0, Math.min(1, weight));
  return `#${(["r", "g", "b"] as const)
    .map((k) => clamp(a[k] * (1 - w) + b[k] * w).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function themeCssVars(input: {
  accentColor?: string;
  backgroundColor?: string;
  decoration?: string;
}): Record<string, string> {
  const accent = normalizeHex(input.accentColor, "#0d6e6e");
  const background = normalizeHex(input.backgroundColor, "#eef2f4");
  const decoration = normalizeDecoration(input.decoration);
  const accentDeep = darkenHex(accent, 0.2);
  const bgTop = mixHex(background, "#ffffff", 0.35);
  const bgBottom = mixHex(background, accent, 0.08);

  return {
    "--bg": background,
    "--bg-elevated": mixHex(background, "#ffffff", 0.55),
    "--bg-top": bgTop,
    "--bg-bottom": bgBottom,
    "--accent": accent,
    "--accent-deep": accentDeep,
    "--accent-soft": hexToRgba(accent, 0.12),
    "--accent-glow": hexToRgba(accent, 0.16),
    "--accent-glow-2": hexToRgba(accentDeep, 0.1),
    "--decoration": decoration,
  };
}
