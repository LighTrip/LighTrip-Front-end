import LighTripLogo from "@/src/constant/LighTrip.svg";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const KAKAO_AUTH_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}/oauth2/authorization/kakao`;

export default function LoginScreen() {
  const router = useRouter();

  useEffect(() => {
    const subscription = Linking.addEventListener("url", handleDeepLink);

    console.log("createURL test:", Linking.createURL("auth/callback"));
    console.log("scheme:", Linking.createURL(""));

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, []);

  const isHandling = useRef(false);

  const handleDeepLink = async (event: { url: string }) => {
    if (isHandling.current) return;
    isHandling.current = true;

    console.log("Received deep link:", event.url);

    const parsed = Linking.parse(event.url);
    if (!parsed.path?.includes("auth/callback")) return;

    const accessToken = parsed.queryParams?.accessToken as string | undefined;
    const refreshToken = parsed.queryParams?.refreshToken as string | undefined;
    const isNewUser = parsed.queryParams?.isNewUser === "true";

    if (!accessToken) return;

    await SecureStore.setItemAsync("accessToken", accessToken);
    await SecureStore.setItemAsync("refreshToken", refreshToken ?? "");

    if (isNewUser) {
      router.navigate("/(auth)/signup");
    } else {
      router.navigate("/(tabs)");
    }
  };

  const handleKakaoLogin = async () => {
    await Linking.openURL(KAKAO_AUTH_URL);
  };

  const handleGuest = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.logoContainer}>
        <LighTripLogo width={185} height={51} />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleKakaoLogin}
          activeOpacity={0.85}
          style={styles.kakaoButton}
        >
          <Text style={styles.kakaoButtonText}>카카오 로그인</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleGuest}
          activeOpacity={0.7}
          style={styles.guestButton}
        >
          <Text style={styles.guestButtonText}>로그인 없이 둘러보기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  kakaoButton: {
    backgroundColor: "#FEE500",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kakaoButtonText: {
    color: "#1B2D6B",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  guestButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  guestButtonText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
});
