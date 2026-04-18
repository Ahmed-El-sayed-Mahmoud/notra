import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/constants/theme';
import type { TaskFilter } from '@/types';

interface Props {
  filter: TaskFilter;
  onPlanWithAI: () => void;
}

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const MESSAGES: Record<TaskFilter, { icon: IoniconName; title: string; subtitle: string }> = {
  all: {
    icon: 'sparkles-outline',
    title: 'No tasks yet',
    subtitle: 'Add your first task and let AI help you plan your day',
  },
  active: {
    icon: 'happy-outline',
    title: 'All caught up!',
    subtitle: "You've completed everything. Add more to keep the momentum going.",
  },
  completed: {
    icon: 'document-text-outline',
    title: 'Nothing completed yet',
    subtitle: 'Finish some tasks and they will show up here',
  },
  today: {
    icon: 'sunny-outline',
    title: 'Nothing due today',
    subtitle: 'Your day is clear — want AI to help you plan something?',
  },
  overdue: {
    icon: 'checkmark-circle-outline',
    title: 'No overdue tasks',
    subtitle: "You're on top of everything. Great work!",
  },
};

export const EmptyState = ({ filter, onPlanWithAI }: Props) => {
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  const { icon, title, subtitle } = MESSAGES[filter];

  return (
    <Animated.View
      entering={FadeInDown.duration(380).springify()}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xxl,
      }}
    >
      <Ionicons name={icon} size={64} color={colors.textSecondary} style={{ marginBottom: spacing.lg }} />

      <Text
        style={{
          color: colors.text,
          fontSize: fontSize.xl,
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: spacing.sm,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: colors.textSecondary,
          fontSize: fontSize.md,
          textAlign: 'center',
          lineHeight: fontSize.md * 1.6,
          marginBottom: spacing.xl,
        }}
      >
        {subtitle}
      </Text>

      <Pressable
        onPress={onPlanWithAI}
        style={({ pressed }) => [
          {
            backgroundColor: colors.primary,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.md,
            borderRadius: borderRadius.lg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            ...(shadows.md as object),
            opacity: pressed ? 0.82 : 1,
          },
        ]}
      >
        <Ionicons name="sparkles" size={15} color="#fff" />
        <Text style={{ color: '#fff', fontSize: fontSize.md, fontWeight: '600' }}>
          Plan with AI
        </Text>
      </Pressable>
    </Animated.View>
  );
};
