import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/constants/theme';

interface Props {
  onPress: () => void;
  onLongPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TAB_BAR_HEIGHT = 64;
const TAB_BAR_MARGIN = 12;
const FAB_CLEARANCE  = 12;

export const FAB = ({ onPress, onLongPress }: Props) => {
  const { colors, borderRadius, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);

  const bottom = insets.bottom + TAB_BAR_MARGIN + TAB_BAR_HEIGHT + FAB_CLEARANCE;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onLongPress?.();
  };

  return (
    <AnimatedPressable
      style={[
        {
          position: 'absolute',
          bottom,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: borderRadius.full,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
          ...(shadows.lg as object),
        },
        animatedStyle,
      ]}
      onPress={onPress}
      onLongPress={handleLongPress}
      delayLongPress={450}
      onPressIn={() => { scale.value = withSpring(0.88, { damping: 14, stiffness: 380 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 14, stiffness: 380 }); }}
    >
      <Ionicons name="add" size={30} color="#fff" />
    </AnimatedPressable>
  );
};
