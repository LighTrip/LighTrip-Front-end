import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { profilePolicyLinks } from "../data/profilePolicyLinks";

export default function PrivacyScreen() {
    return(
        <SafeAreaView style={styles.container}>
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
    webview: {
        flex: 1,
    },
})