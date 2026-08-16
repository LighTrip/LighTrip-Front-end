// app/_layout.tsx
import { getValidAccessToken, setAuthExpiredHandler } from "@/src/api/authToken";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// 로그인 여부를 확인하기 전까지 스플래시를 내리지 않는다.
// 이게 없으면 라우터가 먼저 로그인 화면을 그려 버려서, 이미 로그인한 사용자에게도
// 카카오 로그인 화면이 잠깐 스쳐 지나간다.
SplashScreen.preventAutoHideAsync().catch(() => {});

// 네트워크가 느려 토큰 재발급이 늘어져도 스플래시에 갇히지 않도록 상한을 둔다.
const SPLASH_MAX_WAIT_MS = 4000;

export default function RootLayout() {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const [fontsLoaded] = useFonts({
    Griun_Gellyroll: require("../assets/fonts/Griun_Gellyroll-Rg.ttf"),
    Moneygraphy: require("../assets/fonts/Moneygraphy-Pixel.ttf"),
    Freesentation: require("../assets/fonts/Freesentation-4Regular.ttf"),
    'Freesentation-3Light': require("../assets/fonts/Freesentation-3Light.ttf"),
  });

  // refreshToken 까지 만료돼 재발급이 실패하면 로그인 화면으로 되돌린다.
  useEffect(() => {
    setAuthExpiredHandler(() => {
      router.replace("/(auth)");
    });

    return () => setAuthExpiredHandler(null);
  }, [router]);

  useEffect(() => {
    if (!fontsLoaded) return;

    const checkAuth = async () => {
      let token: string | null = null;

      try {
        // 저장된 토큰이 만료됐으면 여기서 재발급까지 시도한다.
        token = await getValidAccessToken();
      } catch (error) {
        console.error("Failed to read access token from SecureStore", error);
      }

      if (token) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)");
      }

      setIsAuthChecked(true);
    };

    checkAuth();
  }, [fontsLoaded]);

  useEffect(() => {
    const hideSplash = () => SplashScreen.hideAsync().catch(() => {});

    if (fontsLoaded && isAuthChecked) {
      // 이동한 화면이 실제로 그려진 다음에 가리개를 걷는다.
      const timer = setTimeout(hideSplash, 50);
      return () => clearTimeout(timer);
    }

    const fallback = setTimeout(hideSplash, SPLASH_MAX_WAIT_MS);
    return () => clearTimeout(fallback);
  }, [fontsLoaded, isAuthChecked]);

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
