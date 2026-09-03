import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconButton } from '@/components/icon-button';
import { Sheet } from '@/components/sheet';
import { useTheme } from '@/hooks/use-theme';
import { useTransactionDraftStore } from '@/stores/use-transaction-draft-store';
import { useLocale } from '@/stores/use-settings-store';
import { fontFamily, fontSize, radius, spacing } from '@/theme';
import { addMonths, formatMonthTitle } from '@/utils/date';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

/** `null` cells pad out the leading gap before the 1st falls on its weekday. */
function buildMonthGrid(year: number, month: number): (number | null)[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstWeekday).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day);
  }
  return cells;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function SelectDate() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const locale = useLocale();
  const occurredAt = useTransactionDraftStore((state) => state.occurredAt);
  const setOccurredAt = useTransactionDraftStore((state) => state.setOccurredAt);

  const selectedDate = useMemo(() => new Date(occurredAt), [occurredAt]);
  const [viewDate, setViewDate] = useState(selectedDate);

  const grid = useMemo(
    () => buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  );

  function selectDay(day: number) {
    const next = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, 12);
    setOccurredAt(next.getTime());
    router.back();
  }

  return (
    <Sheet anchor="center">
      <View>
        <View style={styles.header}>
          <IconButton
            icon={ChevronLeft}
            label={t('selectDate.previousMonth')}
            onPress={() => setViewDate((current) => addMonths(current, -1))}
            size={30}
            variant="ghost"
          />
          <Text style={[styles.title, { color: theme.text }]}>
            {formatMonthTitle(viewDate, locale)}
          </Text>
          <IconButton
            icon={ChevronRight}
            label={t('selectDate.nextMonth')}
            onPress={() => setViewDate((current) => addMonths(current, 1))}
            size={30}
            variant="ghost"
          />
        </View>

        <View style={styles.weekdayRow}>
          {WEEKDAY_LABELS.map((label, index) => (
            <Text
              key={`${label}-${index}`}
              style={[styles.weekdayLabel, { color: theme.textMuted }]}
            >
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {grid.map((day, index) => {
            if (day === null) {
              return <View key={`blank-${index}`} style={styles.cell} />;
            }
            const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, 12);
            const selected = isSameDay(cellDate, selectedDate);
            return (
              <Pressable key={day} onPress={() => selectDay(day)} style={styles.cell}>
                <View
                  style={[
                    styles.dayCircle,
                    { backgroundColor: selected ? theme.accent : 'transparent' },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayLabel,
                      { color: selected ? theme.background : theme.text },
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    width: `${100 / 7}%`,
  },
  dayCircle: {
    alignItems: 'center',
    borderRadius: radius.lg,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  dayLabel: {
    fontSize: fontSize.body,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.h5,
  },
  weekdayLabel: {
    fontSize: fontSize.caption,
    fontWeight: '600',
    textAlign: 'center',
    width: `${100 / 7}%`,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
});
