import { StyleSheet, Text, View } from "react-native";

export default function PassportPreview() {
    return (
        <View style={styles.emptyBox}>
            <Text style={styles.title}>여권 목록 준비 중</Text>
            <Text style={styles.description}>
                추후 여권 기능 연결.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    emptyBox: {
        height: 180,
        borderRadius: 12,
        backgroundColor: "#F2F4F7",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 15,
        fontWeight: "700",
        color: "#333333",
        marginBottom: 6,
    },
    description: {
        fontSize: 12,
        color: "#888888",
        textAlign: "center",
        lineHeight: 18,
    },
});