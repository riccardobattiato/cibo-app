import { Tabs } from 'expo-router';
import React from 'react';
import { Icon } from '@/components/atoms/icon';
import {
  HomeIcon,
  BarChart2Icon,
  PackageIcon,
  SettingsIcon,
  SunIcon,
  MoonStarIcon,
} from 'lucide-react-native';
import { Button } from '@/components/atoms/button';
import { Uniwind, useUniwind } from 'uniwind';
import { useLanguage } from '@/locale/useLanguage';

function ThemeToggle() {
  const { theme } = useUniwind();

  function toggleTheme() {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    Uniwind.setTheme(newTheme);
  }

  return (
    <Button
      onPressIn={toggleTheme}
      size="icon"
      variant="ghost"
      className="ios:size-9 web:mx-4 rounded-full">
      <Icon as={theme === 'dark' ? MoonStarIcon : SunIcon} className="size-5" />
    </Button>
  );
}

export default function TabLayout() {
  const [t] = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerRight: () => <ThemeToggle />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <Icon as={HomeIcon} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: t('tabs.stats'),
          tabBarIcon: ({ color }) => <Icon as={BarChart2Icon} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pantry"
        options={{
          title: t('tabs.pantry'),
          tabBarIcon: ({ color }) => <Icon as={PackageIcon} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => <Icon as={SettingsIcon} color={color} />,
        }}
      />
    </Tabs>
  );
}
