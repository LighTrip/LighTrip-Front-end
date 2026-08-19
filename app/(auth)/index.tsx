import { loginWithApple } from "@/src/api/authApi";
import { saveTokens } from "@/src/api/authToken";
import { BASE_URL } from "@/src/api/config";
import LighTripLogo from "@/src/constant/LighTrip.svg";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const KAKAO_AUTH_URL = `${BASE_URL}/oauth2/authorization/kakao`;

export default function LoginScreen() {
  const router = useRouter();

  useEffect(() => {
    const subscription = Linking.addEventListener("url", handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, []);

  const handleDeepLink = async (event: { url: string }) => {
    const parsed = Linking.parse(event.url);

    if (!parsed.path?.includes("callback")) return;

    const accessToken = parsed.queryParams?.accessToken as string | undefined;
    const refreshToken = parsed.queryParams?.refreshToken as string | undefined;
    const isNewUser = parsed.queryParams?.isNewUser === "true";

    if (!accessToken) return;

    await saveTokens(accessToken, refreshToken);

    if (isNewUser) {
      router.replace("/signup");
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleKakaoLogin = async () => {
    await Linking.openURL(KAKAO_AUTH_URL);
  };

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log("[Apple Login] raw credential:", JSON.stringify(credential));

      const { identityToken, authorizationCode, fullName } = credential;
      if (!identityToken) {
        console.log("[Apple Login] identityToken missing, aborting");
        return;
      }

      // Apple은 최초 로그인 1회에만 fullName을 내려준다. 이후에는 다시 못 받으므로 여기서 캡처해 서버로 넘긴다.
      const nickname = fullName?.givenName
        ? `${fullName.givenName} ${fullName.familyName ?? ""}`.trim()
        : undefined;

      const { accessToken, refreshToken, isNewUser } = await loginWithApple({
        identityToken,
        authorizationCode: authorizationCode ?? undefined,
        nickname,
      });

      await saveTokens(accessToken, refreshToken);

      if (isNewUser) {
        router.replace("/signup");
      } else {
        router.replace("/(tabs)");
      }
    } catch (e: any) {
      if (e.code === "ERR_REQUEST_CANCELED") return;
      Alert.alert("오류", e.message ?? "애플 로그인에 실패했어요.");
    }
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

        {Platform.OS === "ios" && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={16}
            style={styles.appleButton}
            onPress={handleAppleLogin}
          />
        )}
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
  appleButton: {
    height: 50,
  },
  kakaoButton: {
    backgroundColor: "#FEE500",
    borderRadius: 16,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  kakaoButtonText: {
    color: "#1B2D6B",
    fontSize: 18,
    fontWeight: "600",
  },
});
