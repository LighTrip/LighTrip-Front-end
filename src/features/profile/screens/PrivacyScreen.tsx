import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { BackHandler, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { profilePolicyLinks } from "../data/profilePolicyLinks";

export default function PrivacyScreen() {
    const router = useRouter();

    useEffect(() => {
        const subscription = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                router.replace("/profile" as any);
                return true;
            },
        );

        return () => subscription.remove();
    }, [router]);

    return(
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    activeOpacity={0.8}
                    onPress={() => router.replace("/profile" as any)}
                >
                    <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.title}>개인정보처리방침</Text>
                <View style={styles.headerSpacer} />
            </View>
            <WebView
                source={{ uri: profilePolicyLinks.privacy}}
                style={styles.webview}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#090D57",
    },
    header: {
        height: 52,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        backgroundColor: "#090D57",
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
    headerSpacer: {
        width: 40,
    },
    webview: {
        flex: 1,
    },
})
