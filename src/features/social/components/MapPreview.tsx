import { StyleSheet, Text, View } from "react-native";

export default function MapPreview() {
    return (
        <View style={styles.emptyBox}>
            <Text style={styles.title}>지도 연결 준비 중</Text>
            <Text style={styles.description}>
                추후 지도 API 연결.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    emptyBox: {
        height: 180,
        borderRadius: 12,
        backgroundColor: "#101B33",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 15,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 6,
    },
    description: {
        fontSize: 12,
        color: "#C7CEDA",
        textAlign: "center",
        lineHeight: 18,
    },
});