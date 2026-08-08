import { useRouter } from 'expo-router';
import { Pencil, Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { IconButton } from '@/components/icon-button';
import { useCategoryName } from '@/hooks/use-category-name';
import { useFormatCurrency } from '@/hooks/use-format-currency';
import { useTheme } from '@/hooks/use-theme';
import { accentRamp, fontFamily, fontSize, radius, spacing } from '@/theme';

type CategoryRowProps = {
  categoryId: string;
  categoryName: string;
  categoryIsDefault: boolean;
  categoryColor: string;
  amountMinor: number;
  pct: number;
};

export function CategoryRow({
  categoryId,
  categoryName: name,
  categoryIsDefault,
  categoryColor,
  amountMinor,
  pct,
}: CategoryRowProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { format } = useFormatCurrency();
  const resolveName = useCategoryName();

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      layout={LinearTransition.springify().damping(18)}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={[styles.swatch, { backgroundColor: categoryColor }]} />
        <Text style={[styles.name, { color: theme.text }]}>
          {resolveName(name, categoryIsDefault)}
        </Text>
        <Text style={[styles.amount, { color: theme.textMuted }]}>
          {format(amountMinor)}
        </Text>
        <Text style={[styles.pct, { color: theme.text }]}>{pct}%</Text>
        <IconButton
          icon={Pencil}
          label={t('categoriesScreen.editCategory')}
          onPress={() => router.push(`/category/${categoryId}`)}
          size={28}
          variant="ghost"
        />
        <IconButton
          color={accentRamp[700]}
          icon={Trash2}
          label={t('categoriesScreen.deleteCategory')}
          onPress={() => router.push(`/category/${categoryId}/delete`)}
          size={28}
          variant="ghost"
        />
      </View>
      <View style={[styles.track, { backgroundColor: theme.surfaceAlt }]}>
        <View
          style={[
            styles.fill,
            { backgroundColor: categoryColor, width: `${Math.max(pct, 2)}%` },
          ]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  amount: {
    fontSize: fontSize.caption,
  },
  container: {
    gap: 6,
  },
  fill: {
    borderRadius: 4,
    height: '100%',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: fontSize.body,
    fontWeight: '600',
  },
  pct: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.h5,
    textAlign: 'right',
    width: 44,
  },
  swatch: {
    borderRadius: radius.sm - 3,
    height: 12,
    width: 12,
  },
  track: {
    borderRadius: 4,
    height: 8,
    overflow: 'hidden',
  },
});
