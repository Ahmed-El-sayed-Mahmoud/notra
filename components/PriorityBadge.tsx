import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/constants/theme';
import type { Priority } from '@/types';

interface Props {
  priority: Priority;
}

export const PriorityBadge = ({ priority }: Props) => {
  const { colors, borderRadius, fontSize, spacing } = useTheme();
  const color = colors.priority[priority];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: color + '22',
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: borderRadius.full,
        gap: spacing.xs,
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: borderRadius.full,
          backgroundColor: color,
        }}
      />
      <Text style={{ color, fontSize: fontSize.xs, fontWeight: '600' }}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Text>
    </View>
  );
};
