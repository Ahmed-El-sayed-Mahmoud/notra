import { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/constants/theme';
import { useTaskStore } from '@/store/taskStore';
import { parseVoiceTask } from '@/lib/openai';
import { VoiceButton } from './VoiceButton';
import type { Priority } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  startWithVoice?: boolean;
}

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
    month: 'short', day: 'numeric',
    year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

export const AddTaskModal = ({ visible, onClose, startWithVoice = false }: Props) => {
  const { colors, spacing, fontSize, borderRadius } = useTheme();
  const addTask = useTaskStore((s) => s.addTask);

  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority]       = useState<Priority>('medium');
  const [dueDate, setDueDate]         = useState<string | null>(null);
  const [showPicker, setShowPicker]   = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [parseLoading, setParseLoading] = useState(false);
  const [isVoiceInput, setIsVoiceInput] = useState(false);
  const [voiceSummary, setVoiceSummary] = useState<string | null>(null);

  const reset = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate(null);
    setShowPicker(false);
    setParseLoading(false);
    setIsVoiceInput(false);
    setVoiceSummary(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleTranscription = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;
    setParseLoading(true);
    setIsVoiceInput(true);
    try {
      const parsed = await parseVoiceTask(transcript);
      setTitle(parsed.title);
      setDescription(parsed.description ?? '');
      setPriority(parsed.priority);
      if (parsed.dueDate) setDueDate(parsed.dueDate);

      const parts: string[] = [];
      parts.push(parsed.priority.charAt(0).toUpperCase() + parsed.priority.slice(1) + ' priority');
      if (parsed.dueDate) parts.push(`Due ${formatDueLabel(parsed.dueDate)}`);
      if (parsed.description) parts.push('Description added');
      setVoiceSummary(parts.join(' · '));
    } catch {
      setTitle(transcript.trim());
      setVoiceSummary(null);
    } finally {
      setParseLoading(false);
    }
  }, []);

  const handleClearVoice = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate(null);
    setIsVoiceInput(false);
    setVoiceSummary(null);
  };

  const handleDateChange = (_event: DateTimePickerEvent, selected?: Date) => {
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
  };

  const handleCreate = async () => {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    await addTask({ title: title.trim(), description: description.trim() || undefined, priority, dueDate: dueDate ?? null });
    setSubmitting(false);
    reset();
    onClose();
  };

  const pickerDate = dueDate ? new Date(dueDate) : new Date();

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View
        entering={FadeIn.duration(180)}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.48)', justifyContent: 'flex-end' }}
      >
        <Pressable style={{ flex: 1 }} onPress={handleClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Animated.View
            entering={SlideInDown.duration(380).springify()}
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: borderRadius.xl,
              borderTopRightRadius: borderRadius.xl,
              padding: spacing.lg,
              paddingBottom: Platform.OS === 'ios' ? spacing.xl + 16 : spacing.xl,
              gap: spacing.md,
            }}
          >
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '700' }}>
                New Task
              </Text>
              <Pressable onPress={handleClose} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Title row: input + voice button */}
            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <TextInput
                  placeholder="Task title"
                  placeholderTextColor={colors.textSecondary}
                  value={parseLoading ? '' : title}
                  onChangeText={(t) => { setTitle(t); if (isVoiceInput) setIsVoiceInput(false); }}
                  editable={!parseLoading}
                  autoFocus={!startWithVoice}
                  returnKeyType="next"
                  style={{
                    flex: 1,
                    color: colors.text,
                    fontSize: fontSize.md,
                    borderWidth: 1.5,
                    borderColor: title.length > 0 && !parseLoading ? colors.primary : colors.border,
                    borderRadius: borderRadius.md,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm + 2,
                    opacity: parseLoading ? 0.4 : 1,
                  }}
                />
                <VoiceButton
                  onTranscription={handleTranscription}
                  autoStart={startWithVoice}
                  size={44}
                />
              </View>

              {/* Voice state chip */}
              {(parseLoading || isVoiceInput) && (
                <Animated.View
                  entering={FadeIn.duration(180)}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
                    backgroundColor: colors.primary + '12', borderRadius: borderRadius.md,
                    paddingHorizontal: spacing.sm, paddingVertical: 6,
                    borderWidth: 1, borderColor: colors.primary + '33',
                  }}
                >
                  {parseLoading
                    ? <ActivityIndicator size="small" color={colors.primary} style={{ width: 13, height: 13 }} />
                    : <Ionicons name="mic" size={13} color={colors.primary} />
                  }
                  <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: '600', flex: 1 }}>
                    {parseLoading ? 'Parsing…' : voiceSummary ?? 'Voice input'}
                  </Text>
                  {!parseLoading && (
                    <Pressable onPress={handleClearVoice} hitSlop={8}>
                      <Ionicons name="close-circle" size={15} color={colors.textSecondary} />
                    </Pressable>
                  )}
                </Animated.View>
              )}
            </View>

            {/* Description */}
            <TextInput
              placeholder="Description (optional)"
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              editable={!parseLoading}
              multiline
              numberOfLines={3}
              style={{
                color: colors.text,
                fontSize: fontSize.sm,
                borderWidth: 1.5,
                borderColor: colors.border,
                borderRadius: borderRadius.md,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm + 2,
                minHeight: 72,
                textAlignVertical: 'top',
                opacity: parseLoading ? 0.4 : 1,
              }}
            />

            {/* Due date */}
            <View style={{ gap: spacing.xs, opacity: parseLoading ? 0.4 : 1 }}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                Due date
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' }}>
                {DUE_PRESETS.map(({ label, getDate }) => {
                  const active = dueDate !== null && formatDueLabel(dueDate) === label;
                  return (
                    <Pressable
                      key={label}
                      onPress={() => { if (parseLoading) return; setDueDate(active ? null : getDate().toISOString()); setShowPicker(false); }}
                      style={{
                        paddingHorizontal: spacing.sm + 2, paddingVertical: 6,
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
                  onPress={() => { if (!parseLoading) setShowPicker((v) => !v); }}
                  style={{
                    paddingHorizontal: spacing.sm + 2, paddingVertical: 6,
                    borderRadius: borderRadius.full,
                    backgroundColor: showPicker ? colors.primary + '18' : colors.surface,
                    borderWidth: showPicker ? 1.5 : 1,
                    borderColor: showPicker ? colors.primary : colors.border,
                    flexDirection: 'row', alignItems: 'center', gap: 4,
                  }}
                >
                  <Ionicons name="calendar-outline" size={14} color={showPicker ? colors.primary : colors.textSecondary} />
                  <Text style={{ color: showPicker ? colors.primary : colors.textSecondary, fontSize: fontSize.sm, fontWeight: '500' }}>
                    Pick date
                  </Text>
                </Pressable>
                {dueDate && (
                  <Pressable
                    onPress={() => { if (!parseLoading) { setDueDate(null); setShowPicker(false); } }}
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
                  <DateTimePicker value={pickerDate} mode="date" display="spinner" minimumDate={new Date()} onChange={handleDateChange} textColor={colors.text} style={{ height: 140 }} />
                  <Pressable onPress={() => setShowPicker(false)} style={{ alignSelf: 'flex-end', paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: borderRadius.full, backgroundColor: colors.primary }}>
                    <Text style={{ color: '#fff', fontSize: fontSize.sm, fontWeight: '700' }}>Done</Text>
                  </Pressable>
                </View>
              )}
              {showPicker && Platform.OS === 'android' && (
                <DateTimePicker value={pickerDate} mode="date" display="default" minimumDate={new Date()} onChange={handleDateChange} />
              )}
            </View>

            {/* Priority */}
            <View style={{ gap: spacing.xs, opacity: parseLoading ? 0.4 : 1 }}>
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
                      onPress={() => { if (!parseLoading) setPriority(p); }}
                      style={{
                        flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.md, alignItems: 'center',
                        backgroundColor: active ? pColor + '22' : colors.surface,
                        borderWidth: active ? 1.5 : 1, borderColor: active ? pColor : colors.border,
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

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Pressable
                onPress={handleClose}
                style={({ pressed }) => ({ flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.7 : 1 })}
              >
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.md, fontWeight: '600' }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleCreate}
                disabled={!title.trim() || submitting || parseLoading}
                style={({ pressed }) => ({ flex: 2, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', backgroundColor: title.trim() && !parseLoading ? colors.primary : colors.border, opacity: pressed ? 0.82 : 1 })}
              >
                {submitting
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={{ color: '#fff', fontSize: fontSize.md, fontWeight: '700' }}>Add Task</Text>
                }
              </Pressable>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
};
