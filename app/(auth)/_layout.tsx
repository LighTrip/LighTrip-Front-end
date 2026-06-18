import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

export default function AuthLayout() {

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const hideNavigationBar = async () => {
      await NavigationBar.setVisibilityAsync("hidden");
      try {
        await NavigationBar.setBehaviorAsync("overlay-swipe");
      } catch {}
    };
    hideNavigationBar();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
