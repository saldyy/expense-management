import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Seeded categories store an i18n key as their name; user-created ones store a
 * literal string. This resolves either to something displayable.
 */
export function useCategoryName() {
  const { t } = useTranslation();

  return useCallback(
    // Seeded names are i18n keys not known statically, so the key type is widened.
    (name: string, isDefault: boolean): string =>
      isDefault ? (t(name as never) as string) : name,
    [t]
  );
}
