import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { palette } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTaskStore } from "@/store/taskStore";

export const unstable_settings = { anchor: "(tabs)" };

const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: palette.dark.background,
    card: palette.dark.background,
  },
};
const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.light.background,
    card: palette.light.background,
  },
};

function AppBootstrap() {
  const hydrate = useTaskStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={isDark ? darkTheme : lightTheme}>
        <AppBootstrap />
        <Stack
          screenOptions={{
            contentStyle: {
              backgroundColor: isDark
                ? palette.dark.background
                : palette.light.background,
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="task/[id]"
            options={{
              headerShown: false,
              animation: "slide_from_right",
              gestureEnabled: true,
            }}
          />
        </Stack>
        <StatusBar style={isDark ? "light" : "dark"} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
