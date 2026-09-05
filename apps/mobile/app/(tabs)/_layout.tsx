import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MotorsportTheme } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: MotorsportTheme.colors.mBlue,
        tabBarInactiveTintColor: MotorsportTheme.colors.textDim,
        tabBarStyle: {
          backgroundColor: MotorsportTheme.colors.bgDark,
          borderTopColor: MotorsportTheme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Telemetry',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide legacy explore screen from tab bar
        }}
      />
    </Tabs>
  );
}
