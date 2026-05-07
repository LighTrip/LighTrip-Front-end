import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PassportFrame from "../components/PassportFrame";
import SearchToggle from "../components/SearchToggle";
import { searchUserDummy } from "../data/searchDummy";
import { SearchTab } from "../types/search.types";

export default function SearchView() {

    const [selectedTab, setSelectedTab] = useState<SearchTab>("all")

    return(
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/*헤더*/}
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {selectedTab === "all" ? "둘러보기" : "이번 주 랭킹"}
                    </Text>

                    <SearchToggle
                        selectedTab={selectedTab}
                        onChangeTab={setSelectedTab}
                    />
                </View>

                {selectedTab === "all" ? (
                    <AllSearchContent />
                ) : (
                    <RankingContent />
                )}         
            </ScrollView>
        </SafeAreaView>   
    )
}

function AllSearchContent() {
    return(
        <View style={styles.card}>
            <Image 
                source={require("@/assets/images/noise.png")}
                style={styles.noiseBackground}
                resizeMode="cover"
            />

            <View style={styles.cardContent}>
                <View style={styles.userRow}>
                    <Image
                        source={require("@/assets/images/profile1.jpg")}
                        style={styles.profileImage}
                    />

                    <View style={styles.userTextArea}>
                        <View style={styles.nameRow}>
                            <Text style={styles.userName}>{searchUserDummy.name}</Text>
                            <Text style={styles.userId}>#{searchUserDummy.id}</Text>
                        </View>

                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={12} color="#666667" />
                            <Text style={styles.locationText}>{searchUserDummy.location}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.addButton}>
                        <Ionicons name="person-add-outline" size={20} color="#000000" />
                    </TouchableOpacity>
                </View>
                
                <PassportFrame />
            </View>
        </View>
    )
}

function RankingContent() {
    return(
        <Text>랭킹 페이지</Text>
    )
}

const styles = StyleSheet.create({
    // 둘러보기
    container: {
        flex: 1,
        backgroundColor: "#F8FAFD",
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 22,
        paddingBottom: 120,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    title: {
        fontWeight: "700",
        color: "#000000",
        fontSize: 24
    },
    card: {
        position: "relative",
        backgroundColor: "#F8FAFD",
        borderRadius: 16,
        padding: 22,
        shadowColor: "#000000",
        shadowOpacity: 0.13,
        shadowRadius: 6,
        elevation: 5,
        overflow: "hidden",
    },
    noiseBackground: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        opacity: 1,
        zIndex: 0,
    },
    cardContent: {
        position: "relative",
        zIndex: 1,
    },
    userRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 22,
    },
    profileImage: {
        height: 48,
        width: 48,
        borderRadius: 24,
    },
    userTextArea: {
        flex: 1,
        marginLeft: 12,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    userName: {
        fontSize: 20,
        fontWeight: "700",
        color: "#000000",
    },
    userId: {
        marginLeft: 5,
        fontSize: 14,
        color: "#666667",
        fontWeight: "500",
        marginTop: 5,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    locationText: {
        marginLeft: 2,
        fontSize: 10,
        color: "#666667",
    },
    addButton: {
        marginTop: 35,
    },

    // 랭킹
});