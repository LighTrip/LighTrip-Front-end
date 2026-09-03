import { scaleH, scaleW } from "@/src/utils/scale";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type PassportActionButtonsProps = {
  isLiked: boolean;
  isScrapped: boolean;
  isLiking?: boolean;
  isScrapping?: boolean;
  onPressLike: () => void;
  onPressScrap: () => void;
};

export default function PassportActionButtons({
  isLiked,
  isScrapped,
  isLiking = false,
  isScrapping = false,
  onPressLike,
  onPressScrap,
}: PassportActionButtonsProps) {
  return (
    <View style={styles.actionButtonArea}>
      <TouchableOpacity onPress={onPressLike} disabled={isLiking}>
        <Ionicons
          name={isLiked ? "heart" : "heart-outline"}
          size={24}
          color={isLiked ? "#ED3838" : "#333333"}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={onPressScrap} disabled={isScrapping}>
        <Ionicons
          name={isScrapped ? "bookmark" : "bookmark-outline"}
          size={24}
          color={isScrapped ? "#FFD233" : "#333333"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButtonArea: {
    position: "absolute",
    top: scaleH(7),
    right: scaleW(14),
    zIndex: 20,
    gap: scaleH(7),
  },
});
