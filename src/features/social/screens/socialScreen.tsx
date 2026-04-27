import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FriendGrid from "../components/FriendGrid";
import SocialSearchBar from "../components/SocialSearchBar";

export default function SocialView() {
    return(
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>소셜</Text>

                <TouchableOpacity activeOpacity={0.8} style={styles.addButton}>
                    <Ionicons name="person-add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <SocialSearchBar />

            <FriendGrid />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFD",
    },
    header: {
        marginTop: 20,
        paddingHorizontal: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        color: "#000000",
        fontSize: 24,
        fontWeight: "700",
    },
    addButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#FDA162",
        alignItems: "center",
        justifyContent: "center",
    },
})