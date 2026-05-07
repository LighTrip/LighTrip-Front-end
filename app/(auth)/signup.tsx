import LighTripLogo from "@/src/constant/LighTrip.svg";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignupScreen() {
  const router = useRouter();

  const [nickname, setNickname] = useState("");
  const [region, setRegion] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  const isFormValid = nickname.trim().length > 0 && region.trim().length > 0;

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setLoading(true);
    try {
      router.replace("/(tabs)");
    } catch (e) {
      Alert.alert("오류", "프로필 저장에 실패했어요. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>
            {/* 로고 */}
            <View style={styles.logoContainer}>
              <LighTripLogo width={185} height={51} />
            </View>

            {/* 폼 */}
            <View style={styles.formContainer}>
              {/* 닉네임 */}
              <View style={styles.inputCard}>
                <View style={styles.inputHeader}>
                  <Text style={styles.inputLabel}>닉네임</Text>
                  <Text style={styles.inputCounter}>{nickname.length}/10</Text>
                </View>
                <TextInput
                  value={nickname}
                  onChangeText={(t) => {
                    if (t.length <= 10) setNickname(t);
                  }}
                  placeholder="ex. 홍길동"
                  placeholderTextColor="#C5C9D6"
                  style={styles.textInput}
                  maxLength={10}
                  returnKeyType="next"
                  autoCapitalize="none"
                />
              </View>

              {/* 활동 지역 */}
              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>활동 지역</Text>
                <TextInput
                  value={region}
                  onChangeText={setRegion}
                  placeholder="서울시 용산구"
                  placeholderTextColor="#C5C9D6"
                  style={styles.textInput}
                  returnKeyType="next"
                  autoCapitalize="none"
                />
              </View>

              {/* 한 줄 소개 */}
              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>한 줄 소개</Text>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="자신을 소개하는 문구를 입력하세요."
                  placeholderTextColor="#C5C9D6"
                  style={[styles.textInput, styles.textArea]}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  returnKeyType="done"
                />
              </View>
            </View>

            <View style={styles.spacer} />

            {/* 시작하기 버튼 */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!isFormValid || loading}
              activeOpacity={0.85}
              style={[
                styles.submitButton,
                isFormValid
                  ? styles.submitButtonActive
                  : styles.submitButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.submitButtonText,
                  isFormValid
                    ? styles.submitButtonTextActive
                    : styles.submitButtonTextDisabled,
                ]}
              >
                {loading ? "저장 중..." : "시작하기"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1B2D6B",
    fontStyle: "italic",
    letterSpacing: -1,
  },
  formContainer: {
    gap: 12,
  },
  inputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  inputCounter: {
    fontSize: 12,
    color: "#D1D5DB",
  },
  textInput: {
    fontSize: 15,
    color: "#1B2D6B",
  },
  textArea: {
    minHeight: 80,
  },
  spacer: {
    flex: 1,
  },
  submitButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  submitButtonActive: {
    backgroundColor: "#FEE500",
    shadowColor: "#FEE500",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#E5E7EB",
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  submitButtonTextActive: {
    color: "#1B2D6B",
  },
  submitButtonTextDisabled: {
    color: "#9CA3AF",
  },
});
