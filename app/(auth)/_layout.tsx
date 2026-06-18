import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function AuthLayout() {

  useEffect(() => {
    const hideNavigationBar = async () => {
      await NavigationBar.setVisibilityAsync("hidden");
      await NavigationBar.setBehaviorAsync("overlay-swipe");
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
