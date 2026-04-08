import { StatusBar } from "expo-status-bar";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-100">
      {/* 카드 형태의 컨테이너 */}
      <View className="p-6 bg-white rounded-3xl shadow-xl border border-slate-200 w-80 items-center">
        {/* 아이콘 역할의 텍스트 */}
        <View className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center mb-4">
          <Text className="text-2xl">✈️</Text>
        </View>

        <Text className="text-2xl font-bold text-slate-800">LighTrip</Text>

        <Text className="text-slate-500 text-center mt-2 mb-6">
          Tailwind CSS가 정상적으로{"\n"}적용되었습니다!
        </Text>

        {/* 클릭 가능한 버튼 */}
        <TouchableOpacity
          className="bg-blue-600 px-8 py-3 rounded-xl active:bg-blue-800"
          onPress={() => console.log("Button Pressed")}
        >
          <Text className="text-white font-semibold">시작하기</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}
