import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SearchTab } from "../types/search.types";

type SearchToggleProps = {
    selectedTab: SearchTab;
    onChangeTab: (tab: SearchTab) => void;
}

export default function SearchToggle({selectedTab, onChangeTab}: SearchToggleProps) {
    return (
        <View style={styles.toggleBox}>
            <TouchableOpacity
                style={[
                    styles.toggleButton,
                    selectedTab === "all" && styles.activeToggle,
                ]}
                onPress={() => onChangeTab("all")}
            >
                <Text
                    style={[
                        styles.toggleText,
                        selectedTab === "all" && styles.activeToggleText,
                    ]}
                >
                    전체
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.toggleButton,
                    selectedTab === "ranking" && styles.activeToggle,
                ]}
                onPress={() => onChangeTab("ranking")}
            >
                <Text
                    style={[
                        styles.toggleText,
                        selectedTab === "ranking" && styles.activeToggleText,
                    ]}
                >
                    랭킹
                </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    toggleBox: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        borderColor: "#c6c6c6",
        borderWidth: 2.5,
    },
    toggleButton: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 18,
    },
    activeToggle: {
        backgroundColor: "#1A3A6B",
    },
    toggleText: {
        fontSize: 12,
        color: "#000000",
        fontWeight: "500",
    },
    activeToggleText: {
        color: "#FFFFFF",
        fontWeight: "500",
    }
})