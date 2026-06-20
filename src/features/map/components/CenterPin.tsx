import PinIcon from "@/assets/icons/pin.svg";
import { StyleSheet, View } from "react-native";

export function CenterPin() {
  return (
    <View style={styles.wrapper} pointerEvents="none">
      <PinIcon width={40} height={40} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -40,
    zIndex: 10,
  },
});
