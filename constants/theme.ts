import { Platform } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const palette = {
  primary: '#6C63FF',
  primaryLight: '#8B84FF',
  primaryDark: '#4B44CC',

  priority: {
    high: '#FF4757',
    medium: '#FFA502',
    low: '#2ED573',
  },

  light: {
    background: '#FFFFFF',
    surface: '#F8F8FF',
    card: '#FFFFFF',
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    shadow: '#000000',
  },

  dark: {
    background: '#0F0F1A',
    surface: '#1A1A2E',
    card: '#252538',
    text: '#F1F1F5',
    textSecondary: '#9CA3AF',
    border: '#2D2D44',
    shadow: '#000000',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: palette.light.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    android: { elevation: 2 },
    default: {},
  }),
  md: Platform.select({
    ios: {
      shadowColor: palette.light.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    android: { elevation: 4 },
    default: {},
  }),
  lg: Platform.select({
    ios: {
      shadowColor: palette.light.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
    },
    android: { elevation: 8 },
    default: {},
  }),
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Colors = {
  light: palette.light,
  dark: palette.dark,
};

export type Theme = {
  colors: typeof palette.light & { primary: string; primaryLight: string; primaryDark: string; priority: typeof palette.priority };
  spacing: typeof spacing;
  fontSize: typeof fontSize;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  fonts: typeof Fonts;
  isDark: boolean;
};

export const useTheme = (): Theme => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const modeColors = isDark ? palette.dark : palette.light;

  return {
    colors: {
      ...modeColors,
      primary: palette.primary,
      primaryLight: palette.primaryLight,
      primaryDark: palette.primaryDark,
      priority: palette.priority,
    },
    spacing,
    fontSize,
    borderRadius,
    shadows,
    fonts: Fonts,
    isDark,
  };
};
