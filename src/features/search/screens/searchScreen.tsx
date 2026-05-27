import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AllSearchContent from "../components/AllSearchContent";
import RankingContent from "../components/RankingContent";
import SearchToggle from "../components/SearchToggle";
import { SearchTab } from "../types/search.types";

export default function SearchView() {
    const [selectedTab, setSelectedTab] = useState<SearchTab>("all");
    const [requestedFriendCodes, setRequestedFriendCodes] = useState<string[]>([]);


    return (
        <SafeAreaView style={styles.container}>
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
                <AllSearchContent 
                    requestedFriendCodes ={requestedFriendCodes}
                    setRequestedFriendCodes={setRequestedFriendCodes}
                />
            ) : (
                <RankingContent />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFD",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
        paddingHorizontal: 20,
        paddingTop: 22,
    },
    title: {
        fontWeight: "700",
        color: "#000000",
        fontSize: 24,
    },
});