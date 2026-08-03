import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, type ColorValue } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** Emoji stand-ins keep the scaffold dependency-free; swap for an icon set later. */
function TabIcon({ icon, color }: { icon: string; color: ColorValue }) {
  return <Text style={[styles.icon, { color }]}>{icon}</Text>;
}

export default function TabsLayout() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.overview'),
          tabBarIcon: ({ color }) => <TabIcon color={color} icon="◎" />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: t('tabs.transactions'),
          tabBarIcon: ({ color }) => <TabIcon color={color} icon="≡" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => <TabIcon color={color} icon="⚙" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 20,
  },
});
