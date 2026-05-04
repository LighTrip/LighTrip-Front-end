import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
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
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-10 pb-8">
            <View className="mb-10">
              <Text
                className="text-4xl font-bold text-[#1B2D6B]"
                style={{ fontStyle: "italic", letterSpacing: -1 }}
              ></Text>
            </View>

            <View className="gap-y-3">
              <View
                className="bg-white rounded-2xl px-4 py-3 border border-transparent"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-xs text-gray-400 font-medium tracking-wide">
                    닉네임
                  </Text>
                  <Text className="text-xs text-gray-300">
                    {nickname.length}/10
                  </Text>
                </View>
                <TextInput
                  value={nickname}
                  onChangeText={(t) => {
                    if (t.length <= 10) setNickname(t);
                  }}
                  placeholder="ex. 홍길동"
                  placeholderTextColor="#C5C9D6"
                  className="text-[#1B2D6B] text-base"
                  maxLength={10}
                  returnKeyType="next"
                  autoCapitalize="none"
                />
              </View>

              {/* 활동 지역 */}
              <View
                className="bg-white rounded-2xl px-4 py-3"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text className="text-xs text-gray-400 font-medium tracking-wide mb-1">
                  활동 지역
                </Text>
                <TextInput
                  value={region}
                  onChangeText={setRegion}
                  placeholder="서울시 용산구"
                  placeholderTextColor="#C5C9D6"
                  className="text-[#1B2D6B] text-base"
                  returnKeyType="next"
                  autoCapitalize="none"
                />
              </View>

              <View
                className="bg-white rounded-2xl px-4 pt-3 pb-2"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text className="text-xs text-gray-400 font-medium tracking-wide mb-1">
                  한 줄 소개
                </Text>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="자신을 소개하는 문구를 입력하세요."
                  placeholderTextColor="#C5C9D6"
                  className="text-[#1B2D6B] text-base"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={{ minHeight: 80 }}
                  returnKeyType="done"
                />
              </View>
            </View>

            <View className="flex-1" />
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!isFormValid || loading}
              activeOpacity={0.85}
              className={`rounded-2xl py-4 items-center justify-center mt-6 ${
                isFormValid ? "bg-[#FEE500]" : "bg-gray-200"
              }`}
              style={
                isFormValid
                  ? {
                      shadowColor: "#FEE500",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.4,
                      shadowRadius: 8,
                      elevation: 4,
                    }
                  : {}
              }
            >
              <Text
                className={`text-base font-bold tracking-wide ${
                  isFormValid ? "text-[#1B2D6B]" : "text-gray-400"
                }`}
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
