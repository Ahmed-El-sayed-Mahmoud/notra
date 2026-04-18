import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '@/constants/theme';
import { useTaskStore } from '@/store/taskStore';
import type { Priority } from '@/types';

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

function addDays(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(23, 59, 0, 0);
  return d;
}

const DUE_PRESETS = [
  { label: 'Today',    getDate: () => addDays(0) },
  { label: 'Tomorrow', getDate: () => addDays(1) },
  { label: '+7 days',  getDate: () => addDays(7) },
];

function formatDueLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString())    return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, fontSize, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();

  const task = useTaskStore((s) => s.tasks.find((t) => t.id === id));
  const { updateTask, deleteTask } = useTaskStore();

  const [localTitle, setLocalTitle]             = useState(task?.title ?? '');
  const [localDescription, setLocalDescription] = useState(task?.description ?? '');
  const [priority, setPriority]                 = useState<Priority>(task?.priority ?? 'medium');
  const [dueDate, setDueDate]                   = useState<string | null>(task?.dueDate ?? null);
  const [showPicker, setShowPicker]             = useState(false);

  const titleRef = useRef<TextInput>(null);

  const isDirty =
    localTitle.trim() !== (task?.title ?? '') ||
    localDescription !== (task?.description ?? '') ||
    priority !== (task?.priority ?? 'medium') ||
    dueDate !== (task?.dueDate ?? null);

  const handleSave = useCallback(() => {
    if (!id || !localTitle.trim()) return;
    updateTask(id, {
      title: localTitle.trim(),
      description: localDescription.trim() || undefined,
      priority,
      dueDate,
    });
    router.back();
  }, [id, localTitle, localDescription, priority, dueDate, updateTask]);

  const handleDateChange = useCallback((_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (_event.type === 'set' && selected) {
        selected.setHours(23, 59, 0, 0);
        setDueDate(selected.toISOString());
      }
    } else if (selected) {
      selected.setHours(23, 59, 0, 0);
      setDueDate(selected.toISOString());
    }
  }, []);

  const handlePresetDate = useCallback((date: Date | null) => {
    setDueDate(date ? date.toISOString() : null);
    setShowPicker(false);
  }, []);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Task',
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            await deleteTask(id);
            router.back();
          },
        },
      ]
    );
  }, [id, deleteTask]);

  if (!task) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.md }}>Task not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: spacing.md }}>
          <Text style={{ color: colors.primary, fontSize: fontSize.md }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const pickerDate = dueDate ? new Date(dueDate) : new Date();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: insets.top + spacing.sm,
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
          <Text style={{ color: colors.primary, fontSize: fontSize.md, fontWeight: '500' }}>Back</Text>
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Pressable
            onPress={handleSave}
            disabled={!isDirty || !localTitle.trim()}
            hitSlop={8}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, opacity: isDirty && localTitle.trim() ? 1 : 0.3 }}
          >
            <Ionicons name="checkmark-circle-outline" size={22} color={colors.primary} />
            <Text style={{ color: colors.primary, fontSize: fontSize.md, fontWeight: '600' }}>Save</Text>
          </Pressable>

          <Pressable onPress={handleDelete} hitSlop={8}>
            <Ionicons name="trash-outline" size={22} color={colors.priority.high} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 48, gap: spacing.lg }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <TextInput
          ref={titleRef}
          value={localTitle}
          onChangeText={setLocalTitle}
          placeholder="Task title"
          placeholderTextColor={colors.textSecondary}
          multiline
          style={{
            color: colors.text,
            fontSize: fontSize.xxl,
            fontWeight: '800',
            letterSpacing: -0.5,
            lineHeight: fontSize.xxl * 1.3,
          }}
        />

        {/* Description */}
        <TextInput
          value={localDescription}
          onChangeText={setLocalDescription}
          placeholder="Add a description…"
          placeholderTextColor={colors.textSecondary}
          multiline
          style={{
            color: colors.textSecondary,
            fontSize: fontSize.md,
            lineHeight: fontSize.md * 1.6,
          }}
        />

        {/* Priority */}
        <View style={{ gap: spacing.xs }}>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Priority
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {PRIORITIES.map((p) => {
              const active = priority === p;
              const pColor = colors.priority[p];
              return (
                <Pressable
                  key={p}
                  onPress={() => setPriority(p)}
                  style={{
                    flex: 1,
                    paddingVertical: spacing.sm,
                    borderRadius: borderRadius.md,
                    alignItems: 'center',
                    backgroundColor: active ? pColor + '22' : colors.surface,
                    borderWidth: active ? 1.5 : 1,
                    borderColor: active ? pColor : colors.border,
                  }}
                >
                  <Text style={{ color: active ? pColor : colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' }}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Due date */}
        <View style={{ gap: spacing.xs }}>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Due date
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' }}>
            {DUE_PRESETS.map(({ label, getDate }) => {
              const active = dueDate !== null && formatDueLabel(dueDate) === label;
              return (
                <Pressable
                  key={label}
                  onPress={() => handlePresetDate(active ? null : getDate())}
                  style={{
                    paddingHorizontal: spacing.sm + 2,
                    paddingVertical: 6,
                    borderRadius: borderRadius.full,
                    backgroundColor: active ? colors.primary + '18' : colors.surface,
                    borderWidth: active ? 1.5 : 1,
                    borderColor: active ? colors.primary : colors.border,
                  }}
                >
                  <Text style={{ color: active ? colors.primary : colors.textSecondary, fontSize: fontSize.sm, fontWeight: active ? '700' : '500' }}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => setShowPicker((v) => !v)}
              style={{
                paddingHorizontal: spacing.sm + 2,
                paddingVertical: 6,
                borderRadius: borderRadius.full,
                backgroundColor: showPicker ? colors.primary + '18' : colors.surface,
                borderWidth: showPicker ? 1.5 : 1,
                borderColor: showPicker ? colors.primary : colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Ionicons name="calendar-outline" size={14} color={showPicker ? colors.primary : colors.textSecondary} />
              <Text style={{ color: showPicker ? colors.primary : colors.textSecondary, fontSize: fontSize.sm, fontWeight: '500' }}>
                Pick date
              </Text>
            </Pressable>

            {dueDate && (
              <Pressable
                onPress={() => handlePresetDate(null)}
                style={{ paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}
              >
                <Ionicons name="close" size={14} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>

          {dueDate && !showPicker && (
            <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' }}>
              Due {formatDueLabel(dueDate)}
            </Text>
          )}

          {showPicker && Platform.OS === 'ios' && (
            <View style={{ gap: spacing.xs }}>
              <DateTimePicker
                value={pickerDate}
                mode="date"
                display="spinner"
                minimumDate={new Date()}
                onChange={handleDateChange}
                textColor={colors.text}
                style={{ height: 140 }}
              />
              <Pressable
                onPress={() => setShowPicker(false)}
                style={{ alignSelf: 'flex-end', paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: borderRadius.full, backgroundColor: colors.primary }}
              >
                <Text style={{ color: '#fff', fontSize: fontSize.sm, fontWeight: '700' }}>Done</Text>
              </Pressable>
            </View>
          )}
          {showPicker && Platform.OS === 'android' && (
            <DateTimePicker value={pickerDate} mode="date" display="default" minimumDate={new Date()} onChange={handleDateChange} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
