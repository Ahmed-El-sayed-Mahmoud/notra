import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/constants/theme';

export default function AIScreen() {
  const { colors, spacing, fontSize } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', paddingBottom: insets.bottom }}>
      <Ionicons name="sparkles-outline" size={56} color={colors.primary} style={{ marginBottom: spacing.md }} />
      <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '700' }}>AI Assistant</Text>
      <Text style={{ color: colors.textSecondary, fontSize: fontSize.md, marginTop: spacing.xs }}>Coming soon</Text>
    </View>
  );
}
