import { Text, View } from "react-native";

export default function RankingScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#1a1a2e",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "white", fontSize: 18 }}>랭킹 페이지</Text>
    </View>
  );
}
