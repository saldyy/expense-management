import { useColorScheme } from 'react-native';

import { useThemeMode } from '@/stores/use-settings-store';
import { colors, type ColorScheme, type Colors } from '@/theme';

/** Resolves the persisted theme preference against the OS setting. */
export function useColorSchemeName(): ColorScheme {
  const systemScheme = useColorScheme();
  const themeMode = useThemeMode();

  if (themeMode === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return themeMode;
}

export function useTheme(): Colors {
  return colors[useColorSchemeName()];
}
