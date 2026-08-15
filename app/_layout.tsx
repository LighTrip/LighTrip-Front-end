// app/_layout.tsx
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Griun_Gellyroll: require("../assets/fonts/Griun_Gellyroll-Rg.ttf"),
    Moneygraphy: require("../assets/fonts/Moneygraphy-Pixel.ttf"),
    Freesentation: require("../assets/fonts/Freesentation-4Regular.ttf"),
    'Freesentation-3Light': require("../assets/fonts/Freesentation-3Light.ttf"),
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    const checkAuth = async () => {
      let token: string | null = null;

      try {
        token = await SecureStore.getItemAsync("accessToken");
      } catch (error) {
        console.error("Failed to read access token from SecureStore", error);
      }

      if (token) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)");
      }
    };

    checkAuth();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </GestureHandlerRootView>
  );
}
