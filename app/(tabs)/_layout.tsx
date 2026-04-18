import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/constants/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color, size }: { name: IoniconName; color: string; size: number }) {
  return <Ionicons name={name} size={size} color={color} />;
}

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarBottom = insets.bottom + 4;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          position: 'absolute',
          bottom: tabBarBottom,
          left: 20,
          right: 20,
          borderRadius: 28,
          height: 64,
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: 'transparent',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.14,
          shadowRadius: 20,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={isDark ? 55 : 75}
            tint={isDark ? 'dark' : 'light'}
            style={{
              flex: 1,
              borderRadius: 28,
              overflow: 'hidden',
              backgroundColor: isDark ? 'rgba(26,26,46,0.82)' : 'rgba(255,255,255,0.82)',
            }}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 6,
        },
        tabBarItemStyle: { paddingTop: 10 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="checkmark-circle-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="today-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="sparkles-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="settings-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
