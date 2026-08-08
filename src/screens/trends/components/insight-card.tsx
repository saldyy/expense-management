import { StyleSheet, Text } from 'react-native';

import { Card } from '@/components/card';
import { useTheme } from '@/hooks/use-theme';
import { fontSize } from '@/theme';

type InsightCardProps = {
  kicker: string;
  text: string;
};

export function InsightCard({ kicker, text }: InsightCardProps) {
  const theme = useTheme();

  return (
    <Card elevated>
      <Text style={[styles.kicker, { color: theme.accent }]}>{kicker}</Text>
      <Text style={[styles.body, { color: theme.text }]}>{text}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: fontSize.caption,
    opacity: 0.85,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
