import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/constants/theme';
import { useTaskStore, getTodayTasks } from '@/store/taskStore';
import { TaskCard } from '@/components/TaskCard';
import { EmptyState } from '@/components/EmptyState';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FlatList } from 'react-native';
import type { Task } from '@/types';
import { useCallback } from 'react';

export default function TodayScreen() {
  const { colors, spacing, fontSize } = useTheme();
  const insets = useSafeAreaInsets();
  const { tasks, toggleComplete, deleteTask } = useTaskStore();
  const todayTasks = getTodayTasks(tasks);

  const handlePress = useCallback((_task: Task) => {}, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Task; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(300).springify()}>
        <TaskCard
          task={item}
          onComplete={toggleComplete}
          onDelete={deleteTask}
          onPress={handlePress}
        />
      </Animated.View>
    ),
    [toggleComplete, deleteTask, handlePress]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
        <Text style={{ color: colors.text, fontSize: fontSize.xxxl, fontWeight: '800', letterSpacing: -0.5 }}>
          Today
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 }}>
          {todayTasks.length === 0
            ? 'No tasks due today'
            : `${todayTasks.length} task${todayTasks.length !== 1 ? 's' : ''} due today`}
        </Text>
      </View>
      <FlatList
        data={todayTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: spacing.xs, paddingBottom: insets.bottom + 100, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState filter="today" onPlanWithAI={() => {}} />}
      />
    </View>
  );
}
