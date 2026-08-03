export const palette = {
  expense: '#FF375F',
  income: '#30D158',
  accent: '#4630EB',
} as const;

/** The contract every color scheme must satisfy. */
export type Colors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textInverse: string;
  expense: string;
  income: string;
  accent: string;
};

const light: Colors = {
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceAlt: '#F7F7FA',
  border: '#E3E3E8',
  text: '#11111A',
  textMuted: '#6B6B76',
  textInverse: '#FFFFFF',
  ...palette,
} as const;

const dark: Colors = {
  background: '#000000',
  surface: '#1C1C1E',
  surfaceAlt: '#2C2C2E',
  border: '#3A3A3C',
  text: '#F5F5F7',
  textMuted: '#98989F',
  textInverse: '#11111A',
  ...palette,
} as const;

export type ColorScheme = 'light' | 'dark';

export const colors: Record<ColorScheme, Colors> = { light, dark };

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const fontSize = {
  caption: 12,
  body: 15,
  subtitle: 17,
  title: 22,
  display: 34,
} as const;
