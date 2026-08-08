/**
 * Modernist design tokens — flat, architectural, near-mono red-on-white
 * (near-black in dark mode), Archivo throughout, 2px dividers as the primary
 * structural device. Ported from the design/_ds Modernist stylesheet.
 */

export const accentRamp = {
  100: '#fff2ef',
  200: '#ffe0d9',
  300: '#ffc4b8',
  400: '#ff9783',
  500: '#ff563c',
  600: '#dd2b0f',
  700: '#ae1800',
  800: '#7c1405',
  900: '#4d170e',
} as const;

const neutralRampBase = {
  400: '#bab6b6',
  500: '#9b9797',
  600: '#7d7979',
  700: '#605d5d',
  800: '#444141',
  900: '#2d2b2b',
} as const;

export const neutralRamp = {
  light: { ...neutralRampBase, 100: '#f8f4f4', 200: '#eae7e7', 300: '#d7d3d3' },
  dark: { ...neutralRampBase, 100: '#242228', 200: '#2c2a30', 300: '#3a3840' },
} as const;

export type ColorScheme = 'light' | 'dark';

export type Colors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  divider: string;
  text: string;
  textMuted: string;
  accent: string;
};

const light: Colors = {
  background: '#f3f2f2',
  surface: '#eae9e9',
  surfaceAlt: neutralRamp.light[200],
  divider: 'rgba(32, 30, 29, 0.4)',
  text: '#201e1d',
  textMuted: 'rgba(32, 30, 29, 0.55)',
  accent: '#ec3013',
};

const dark: Colors = {
  background: '#18171b',
  surface: '#242228',
  surfaceAlt: neutralRamp.dark[200],
  divider: 'rgba(243, 242, 242, 0.22)',
  text: '#f3f2f2',
  textMuted: 'rgba(243, 242, 242, 0.55)',
  accent: '#ec3013',
};

export const colors: Record<ColorScheme, Colors> = { light, dark };

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Softened Modernist radii — the mockup overrides the system's literal 0px. */
export const radius = {
  sm: 6,
  md: 10,
  lg: 18,
} as const;

/** Archivo type scale from styles.css. Money figures are one-off literals at their call site. */
export const fontSize = {
  h1: 42,
  h2: 32,
  h3: 25,
  h4: 20,
  h5: 16,
  h6: 13,
  body: 15,
  caption: 11,
} as const;

export const fontFamily = {
  heading: 'Archivo_800ExtraBold',
  semibold: 'Archivo_600SemiBold',
  body: 'Archivo_400Regular',
} as const;
