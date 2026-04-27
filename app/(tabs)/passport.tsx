import { Text, View } from "react-native";

export default function PassportScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#1a1a2e",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "white", fontSize: 18 }}>여권 페이지</Text>
    </View>
  );
}
