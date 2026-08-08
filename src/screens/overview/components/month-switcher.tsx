import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { IconButton } from '@/components/icon-button';
import { useTheme } from '@/hooks/use-theme';
import { useFilterStore } from '@/stores/use-filter-store';
import { useLocale } from '@/stores/use-settings-store';
import { fontFamily, fontSize } from '@/theme';
import { formatMonthTitle } from '@/utils/date';

export function MonthSwitcher() {
  const theme = useTheme();
  const locale = useLocale();
  const monthCursor = useFilterStore((state) => state.monthCursor);
  const goToPreviousMonth = useFilterStore((state) => state.goToPreviousMonth);
  const goToNextMonth = useFilterStore((state) => state.goToNextMonth);

  return (
    <View style={styles.container}>
      <IconButton
        icon={ChevronLeft}
        label="Previous month"
        onPress={goToPreviousMonth}
        variant="secondary"
      />
      <Text style={[styles.title, { color: theme.text }]}>
        {formatMonthTitle(new Date(monthCursor), locale)}
      </Text>
      <IconButton
        icon={ChevronRight}
        label="Next month"
        onPress={goToNextMonth}
        variant="secondary"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.h4,
  },
});
