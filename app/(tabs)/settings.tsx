import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/constants/theme';

export default function SettingsScreen() {
  const { colors, spacing, fontSize } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', paddingBottom: insets.bottom }}>
      <Text style={{ color: colors.textSecondary, fontSize: fontSize.md, fontWeight: '500' }}>
        Coming soon
      </Text>
    </View>
  );
}
