import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, View } from "react-native";

type SocialSearchBarProps = {
    value: string;
    onChangeText: (text: string) => void;
}

export default function SocialSearchBar(
    {value, onChangeText}: SocialSearchBarProps) {
    return(
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="사용자를 검색하세요."
                placeholderTextColor= "#FFFFFF"
                value={value}
                onChangeText={onChangeText}
            />
        <Ionicons name="search" size={24} color="#FFFFFF" />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 52,
        backgroundColor: "#1A3A6B",
        borderRadius: 14,
        paddingHorizontal: 16,
        marginTop: 18,
        marginHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
    },
    input: {
        flex: 1,
        color: "#FFFFFF",
        fontSize: 13,
    },
})

