import LighTripLogo from "@/src/constant/LighTrip.svg";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const KAKAO_AUTH_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}/oauth2/authorization/kakao`;

const REDIRECT_URI = Linking.createURL("auth/callback");

export default function LoginScreen() {
  const router = useRouter();

  useEffect(() => {
    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, []);

  const handleDeepLink = (event: { url: string }) => {
    const parsed = Linking.parse(event.url);
    if (!parsed.path?.includes("auth/callback")) return;

    const token = parsed.queryParams?.token as string | undefined;
    const isNewUser = parsed.queryParams?.isNewUser === "true";

    if (!token) return;

    // await SecureStore.setItemAsync("accessToken", token);

    if (isNewUser) {
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleKakaoLogin = async () => {
    try {
      await WebBrowser.openAuthSessionAsync(KAKAO_AUTH_URL, REDIRECT_URI);
    } catch (e) {
      console.error("카카오 로그인 오류:", e);
    }
  };

  const handleGuest = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />

      <View className="flex-1 items-center justify-center px-8">
        <LighTripLogo width={185} height={51} />
      </View>

      <View className="px-6 pb-8 gap-y-3">
        <TouchableOpacity
          onPress={handleKakaoLogin}
          activeOpacity={0.85}
          className="bg-[#FEE500] rounded-2xl py-4 flex-row items-center justify-center gap-x-2"
        >
          <Text className="text-[#1B2D6B] text-base font-bold tracking-wide">
            카카오 로그인
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleGuest}
          activeOpacity={0.7}
          className="py-4 items-center justify-center"
        >
          <Text className="text-gray-400 text-sm">로그인 없이 둘러보기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
