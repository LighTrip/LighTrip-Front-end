import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type PassportActionButtonsProps = {
    isLiked: boolean;
    isScrapped: boolean;
    onPressLike: () => void;
    onPressScrap: () => void;
};

export default function PassportActionButtons({
    isLiked,
    isScrapped,
    onPressLike,
    onPressScrap,
}: PassportActionButtonsProps) {
    return (
        <View style={styles.actionButtonArea}>
            <TouchableOpacity onPress={onPressLike}>
                <Ionicons
                    name={isLiked ? "heart" : "heart-outline"}
                    size={24}
                    color={isLiked ? "#ED3838" : "#333333"}
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={onPressScrap}>
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
        top: 16,
        right: 14,
        zIndex: 20,
        gap: 10,
    },
});