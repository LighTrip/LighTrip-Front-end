// app/_layout.tsx
import { Stack } from "expo-router";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from 'expo-font';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Griun_Gellyroll': require('../assets/fonts/Griun_Gellyroll-Rg.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </GestureHandlerRootView> 
  );
}
