import { useState, useCallback } from 'react';
import { View, Text, FlatList, ScrollView, Pressable, RefreshControl } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { useTaskStore, getFilteredTasks, getOverdueTasks } from '@/store/taskStore';
import { TaskCard } from '@/components/TaskCard';
import { FAB } from '@/components/FAB';
import { EmptyState } from '@/components/EmptyState';
import { AddTaskModal } from '@/components/AddTaskModal';
import type { Task, TaskFilter } from '@/types';

const FILTERS: { key: TaskFilter; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'today',     label: 'Today' },
  { key: 'active',    label: 'Active' },
  { key: 'overdue',   label: 'Overdue' },
  { key: 'completed', label: 'Completed' },
];

export default function TasksScreen() {
  const { colors, spacing, fontSize, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  const { tasks, filter, setFilter, hydrate, toggleComplete, deleteTask } = useTaskStore();
  const [refreshing, setRefreshing]     = useState(false);
  const [showModal, setShowModal]       = useState(false);
  const [startWithVoice, setStartWithVoice] = useState(false);

  const filtered     = getFilteredTasks(tasks, filter);
  const overdueCount = getOverdueTasks(tasks).length;

  const subtitle =
    `${tasks.length} task${tasks.length !== 1 ? 's' : ''}` +
    (overdueCount > 0 ? ` · ${overdueCount} overdue` : '');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await hydrate();
    setRefreshing(false);
  }, [hydrate]);

  const handlePress = useCallback((task: Task) => {
    router.push(`/task/${task.id}`);
  }, []);

  const handleFABPress = useCallback(() => {
    setStartWithVoice(false);
    setShowModal(true);
  }, []);

  const handleFABLongPress = useCallback(() => {
    setStartWithVoice(true);
    setShowModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setStartWithVoice(false);
  }, []);

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
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.sm,
        }}
      >
        <Text style={{ color: colors.text, fontSize: fontSize.xxxl, fontWeight: '800', letterSpacing: -0.5 }}>
          My Tasks
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 }}>
          {subtitle}
        </Text>
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.xs }}
        style={{ flexGrow: 0, flexShrink: 0 }}
      >
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <Pressable
              key={key}
              onPress={() => setFilter(key)}
              style={{
                paddingHorizontal: spacing.sm + 4,
                paddingVertical: 6,
                borderRadius: borderRadius.full,
                backgroundColor: active ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: active ? colors.primary : colors.border,
              }}
            >
              <Text style={{ color: active ? '#fff' : colors.textSecondary, fontSize: fontSize.sm, fontWeight: active ? '700' : '500' }}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Task list */}
      <FlatList
        key={filter}
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: spacing.xs, paddingHorizontal: spacing.sm, paddingBottom: insets.bottom + 160, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
        ListEmptyComponent={<EmptyState filter={filter} onPlanWithAI={() => {}} />}
      />

      <FAB onPress={handleFABPress} onLongPress={handleFABLongPress} />

      <AddTaskModal
        visible={showModal}
        onClose={handleModalClose}
        startWithVoice={startWithVoice}
      />
    </View>
  );
}
