import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { Gauge, Dumbbell, Timer } from 'lucide-react-native';
import { Typography } from '@/components/ui';
import { Colors } from '@/theme/colors';

export interface NavItem {
  key: string;
  label: string;
  route: string;
  icon: (color: string, size: number) => React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'home',
    label: 'Home',
    route: '/',
    icon: (color, size) => <Gauge size={size} color={color} />,
  },
  {
    key: 'workouts',
    label: 'Workouts',
    route: '/workouts',
    icon: (color, size) => <Dumbbell size={size} color={color} />,
  },
  {
    key: 'session',
    label: 'Session',
    route: '/session',
    icon: (color, size) => <Timer size={size} color={color} />,
  },
];

export const ActionBar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Hide ActionBar on auth screens
  if (pathname.includes('/login') || pathname.includes('(auth)')) {
    return null;
  }

  const handlePress = (route: string) => {
    router.replace(route as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.route === '/'
              ? pathname === '/'
              : pathname.startsWith(item.route);

          const activeColor = Colors.racingRed;
          const inactiveColor = Colors.textMuted;

          return (
            <TouchableOpacity
              key={item.key}
              style={styles.tabItem}
              activeOpacity={0.8}
              onPress={() => handlePress(item.route)}
            >
              {/* Active Racing Stripe Top Accent */}
              {isActive && <View style={styles.activeStripe} />}

              <View style={styles.iconWrapper}>
                {item.icon(isActive ? activeColor : inactiveColor, 22)}
              </View>

              <Typography
                variant="caption"
                style={[
                  styles.tabLabel,
                  isActive ? styles.activeTabLabel : undefined,
                ]}
                color={isActive ? activeColor : inactiveColor}
              >
                {item.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: 8,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    position: 'relative',
  },
  activeStripe: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 3,
    backgroundColor: Colors.racingRed,
    borderRadius: 2,
  },
  iconWrapper: {
    marginBottom: 4,
  },
  tabLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
  },
  activeTabLabel: {
    fontFamily: 'Inter_700Bold',
  },
});
