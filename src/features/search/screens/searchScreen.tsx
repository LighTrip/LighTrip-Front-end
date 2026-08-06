import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AllSearchContent from "../components/AllSearchContent";
import RankingContent from "../components/RankingContent";
import SearchToggle from "../components/SearchToggle";
import { SearchTab } from "../types/search.types";

export type RankingMode = "total" | "district";

export default function SearchView() {
    const [selectedTab, setSelectedTab] = useState<SearchTab>("all");
    const [requestedFriendCodes, setRequestedFriendCodes] = useState<string[]>([]);

    // total & district 선택
    const [rankingMode, setRankingMode] = useState<RankingMode>("total");
    const [isRankingDropdownOpen, setIsRankingDropdownOpen] = useState(false);

    const contentOpacity = useRef(new Animated.Value(1)).current;
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        contentOpacity.setValue(0);

        Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
        }).start();
    }, [selectedTab, contentOpacity]);

    const rankingTitle = 
        rankingMode === "total" ? "이번 주 랭킹" : "구별 랭킹";

    const handleSelectRankingMode = (mode: RankingMode) => {
        setRankingMode(mode);
        setIsRankingDropdownOpen(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Animated.View
                    style={[styles.titleArea, { opacity: contentOpacity }]}
                >
                {selectedTab === 'all' ? (
                    <Text style={styles.title}>둘러보기</Text>
                ) : (
                    <View style={styles.rankingTitleWrapper}>
                        <TouchableOpacity
                            style={styles.rankingTitleButton}
                            activeOpacity={0.8}
                            onPress={() => setIsRankingDropdownOpen((prev) => !prev)}
                        >
                            <Text style={styles.title}>{rankingTitle}</Text>
                            <Ionicons
                                name={
                                    isRankingDropdownOpen
                                        ? "caret-up"
                                        : "caret-down"
                                }
                                size={16}
                                color="#000000"
                            />
                        </TouchableOpacity>

                        {/*토글*/}
                        {isRankingDropdownOpen && (
                            <View style={styles.dropdownBox}>
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() =>
                                        handleSelectRankingMode("total")
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.dropdownText,
                                            rankingMode === "total" &&
                                                styles.activeDropdownText,
                                        ]}
                                    >
                                        이번 주 랭킹
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() =>
                                        handleSelectRankingMode("district")
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.dropdownText,
                                            rankingMode === "district" &&
                                                styles.activeDropdownText,
                                        ]}
                                    >
                                        구별 랭킹
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
                </Animated.View>

                <SearchToggle
                    selectedTab={selectedTab}
                    onChangeTab={(tab) => {
                        setSelectedTab(tab);
                        setIsRankingDropdownOpen(false);
                    }}
                />
            </View>

            <Animated.View
                style={[styles.contentArea, { opacity: contentOpacity }]}
            >
                {selectedTab === "all" ? (
                    <AllSearchContent
                        requestedFriendCodes ={requestedFriendCodes}
                        setRequestedFriendCodes={setRequestedFriendCodes}
                    />
                ) : (
                    <RankingContent rankingMode={rankingMode} />
                )}
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFD",
        overflow: "visible",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        paddingHorizontal: 20,
        paddingTop: 12,
        zIndex: 100,
        elevation: 100,
    },
    contentArea: {
        flex: 1,
    },
    titleArea: {
        zIndex: 200,
        elevation: 200,
    },
    rankingTitleWrapper: {
        position: "relative",
        zIndex: 200,
        elevation: 200,
    },
    title: {
        fontWeight: "700",
        color: "#000000",
        fontSize: 24,
    },
    rankingTitleButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    dropdownBox: {
        position: "absolute",
        top: 34,
        left: 0,
        width: 130,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingVertical: 6,
        shadowColor: "#000",
        shadowOpacity: 0.14,
        shadowRadius: 8,
        elevation: 300,
        zIndex: 300,
    },
    dropdownItem: {
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    dropdownText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666667",
    },
    activeDropdownText: {
        color: "#1A3A6B",
        fontWeight: "700",
    },
})