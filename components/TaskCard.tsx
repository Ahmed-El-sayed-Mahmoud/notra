import React, { useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/constants/theme';
import type { Task } from '@/types';
import { PriorityBadge } from './PriorityBadge';

interface Props {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onPress: (task: Task) => void;
}

const SWIPE_THRESHOLD = 90;

const formatDate = (dateStr: string | null): string | null => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const isOverdue = (dueDate: string | null, completed: boolean): boolean => {
  if (!dueDate || completed) return false;
  return new Date(dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
};

export const TaskCard = ({ task, onComplete, onDelete, onPress }: Props) => {
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();

  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(1);

  const overdue = isOverdue(task.dueDate, task.completed);
  const formattedDate = formatDate(task.dueDate);

  const handleComplete = useCallback(() => onComplete(task.id), [task.id, onComplete]);
  const handleDelete = useCallback(() => onDelete(task.id), [task.id, onDelete]);
  const handlePress = useCallback(() => onPress(task), [task, onPress]);

  const handleCheckPress = useCallback(() => {
    checkScale.value = withSpring(0.75, { damping: 12, stiffness: 500 }, () => {
      checkScale.value = withSpring(1, { damping: 12, stiffness: 500 });
    });
    onComplete(task.id);
  }, [task.id, onComplete, checkScale]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-8, 8])
    .onUpdate((e) => { translateX.value = e.translationX; })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(600, { duration: 220 }, () => runOnJS(handleComplete)());
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-600, { duration: 220 }, () => runOnJS(handleDelete)());
      } else {
        translateX.value = withSpring(0, { damping: 22, stiffness: 320 });
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }));

  const completeBgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  const deleteBgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <View style={{ marginVertical: 5 }}>
      {/* Complete action bg */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0, bottom: 0, left: 0, right: 0,
            backgroundColor: '#2ED573',
            borderRadius: borderRadius.lg,
            justifyContent: 'center',
            paddingLeft: spacing.lg,
          },
          completeBgStyle,
        ]}
      >
        <Ionicons name="checkmark" size={24} color="#fff" />
      </Animated.View>

      {/* Delete action bg */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0, bottom: 0, left: 0, right: 0,
            backgroundColor: '#FF4757',
            borderRadius: borderRadius.lg,
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingRight: spacing.lg,
          },
          deleteBgStyle,
        ]}
      >
        <Ionicons name="trash-outline" size={22} color="#fff" />
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={cardStyle}>
          <Pressable
            onPress={handlePress}
            onPressIn={() => { scale.value = withSpring(0.97, { damping: 22, stiffness: 400 }); }}
            onPressOut={() => { scale.value = withSpring(1, { damping: 22, stiffness: 400 }); }}
          >
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                opacity: task.completed ? 0.58 : 1,
                ...(shadows.md as object),
              }}
            >
              {/* Row: checkbox + title + description + chevron */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
                <Pressable onPress={handleCheckPress} hitSlop={8} style={{ alignItems: 'center', gap: 3 }}>
                  <Animated.View
                    style={[
                      {
                        width: 24,
                        height: 24,
                        borderRadius: borderRadius.full,
                        borderWidth: 2,
                        borderColor: task.completed ? colors.priority.low : colors.primary,
                        backgroundColor: task.completed ? colors.priority.low : colors.primary + '14',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 1,
                      },
                      checkStyle,
                    ]}
                  >
                    {task.completed
                      ? <Ionicons name="checkmark" size={14} color="#fff" />
                      : <Ionicons name="ellipse-outline" size={10} color={colors.primary} />
                    }
                  </Animated.View>
                </Pressable>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: fontSize.md,
                      fontWeight: '600',
                      lineHeight: fontSize.md * 1.4,
                      textDecorationLine: task.completed ? 'line-through' : 'none',
                    }}
                    numberOfLines={1}
                  >
                    {task.title}
                  </Text>
                  {task.description ? (
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: fontSize.sm,
                        lineHeight: fontSize.sm * 1.5,
                        marginTop: 2,
                      }}
                      numberOfLines={2}
                    >
                      {task.description}
                    </Text>
                  ) : null}
                </View>

                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={{ marginTop: 3 }} />
              </View>

              {/* Footer: priority badge + due date */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: spacing.sm,
                  paddingTop: spacing.sm,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                }}
              >
                <PriorityBadge priority={task.priority} />
                {formattedDate && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    {overdue && (
                      <Ionicons name="alert-circle" size={13} color={colors.priority.high} />
                    )}
                    <Text
                      style={{
                        fontSize: fontSize.xs,
                        color: overdue ? colors.priority.high : colors.textSecondary,
                        fontWeight: overdue ? '700' : '400',
                      }}
                    >
                      {formattedDate}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
