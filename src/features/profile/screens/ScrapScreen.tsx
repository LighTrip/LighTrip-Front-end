import { getMyScraps, ScrapPassport } from "@/src/api/list/scrap.api";
import { getPassportDetail } from "@/src/api/passport/passport.api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import PassportDetail from "../../passport/screens/PassportDetail";
import ScrapPassportCard from "../components/ScrapPassportCard";

const PAGE_SIZE = 10;

export default function ScrapScreen() {
    const router = useRouter();

    // 스크랩한 여권 전체 목록 관련 상태
    const [scraps, setScraps] = useState<ScrapPassport[]>([]);
    const [cursor, setCursor] = useState<number | null>(null);
    const [hasNext, setHasNext] = useState(true);

    // 스크랩한 여권 중 하나 열람
    const [selectedPassport, setSelectedPassport] = useState<any | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);



    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // 스크랩 목록 검색
    const filteredScraps = useMemo(() => {
        const keyword = searchText.trim().toLowerCase();

        if(!keyword) {
            return scraps;
        };

        return scraps.filter((item) => {
            return (
                item.spaceName.toLowerCase().includes(keyword) ||
                item.address.toLowerCase().includes(keyword) ||
                item.content.toLowerCase().includes(keyword)
            )
        });
    }, [scraps, searchText]);

    // 스크랩 목록 조회 호출
    const fetchScraps = async ({
        isInitial = false,
        isRefresh = false,
    } : {
        isInitial?: boolean;
        isRefresh?: boolean;
    }) => {
        try {
            if(isInitial) {
                setIsLoading(true);
            }

            if(isRefresh) {
                setIsRefreshing(true);
            }

            const response = await getMyScraps({
                size: PAGE_SIZE,
            })

            console.log("내 스크랩 목록 조회 응답:", response.data);
            
            const result = response.data;

            if(!result.success) {
                throw new Error(result.message || "스크랩 목록 조회 실패");
            }

            setScraps(result.data.content);
            setCursor(result.data.nextCursor);
            setHasNext(result.data.hasNext);
        } catch(error) {
            console.log("스크랩 목록 조회 에러:", error);

            Alert.alert(
                "스크랩 목록 조회 실패",
                error instanceof Error
                    ? error.message
                    : "스크랩 목록을 불러오는 중 문제가 발생했습니다."
            )
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }

    // 스크랩 목록 조회 추가 호출
    const fetchMoreScraps = async () => {
        if(!hasNext || isFetchingMore || cursor === undefined || cursor === null || searchText.trim()) {
            return;
        }

        try {
            setIsFetchingMore(true);

            const response = await getMyScraps({
                cursor,
                size: PAGE_SIZE,
            })

            console.log("내 스크랩 다음 목록 조회 응답:", response.data);

            const result = response.data;

            if(!result.success) {
                throw new Error(result.message || "스크랩 다음 목록 조회 실패");
            }

            setScraps((prev) => [...prev, ...result.data.content]);
            setCursor(result.data.nextCursor);
            setHasNext(result.data.hasNext)
        }catch(error) {
            console.log("스크랩 다음 목록 조회 에러:", error);
        }finally {
            setIsFetchingMore(false);
        }
    }

    useEffect(() => {
        fetchScraps({isInitial: true});
    }, []);

    // 스크랩한 목록 중 여권 하나 호출
    const handlePressCard = async(passportId: number) => {
        try {
            setIsDetailLoading(true);

            console.log("선택한 passportId:", passportId);

            const response = await getPassportDetail(passportId);

            console.log("여권 상세 조회 응답:", response.data);

            const result = response.data;

            if(!result.success) {
                throw new Error(result.message || "여권 상세 조회 실패");
            }

            setSelectedPassport(result.data);
        }catch(error) {
            console.log("여권 상세 조회 에러:", error);

            Alert.alert(
                "여권 상세 조회 실패",
                error instanceof Error
                    ? error.message
                    : "여권 상세를 불러오는 중 문제가 발생했습니다."
            );
        }finally {
            setIsDetailLoading(false);
        }
    }

    const handleSearchSubmit = () => {
        Keyboard.dismiss();
    };

    if(isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1A3A6B" />
            </View>
        )
    }

    if (isDetailLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1A3A6B" />
            </View>
        );
    }
    
    if (selectedPassport) {
        return (
            <PassportDetail
                item={selectedPassport}
                onBack={() => setSelectedPassport(null)}
                editable={false}
            />
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredScraps}
                keyExtractor={(item) => String(item.scrapId)}
                renderItem={({item}) => (
                    <ScrapPassportCard
                        item={item}
                        onPress={handlePressCard}
                    />
                )}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                onEndReached={fetchMoreScraps}
                onEndReachedThreshold={0.4}
                refreshing={isRefreshing}
                onRefresh={() => fetchScraps({isRefresh: true})}
                ListHeaderComponent={
                    <View>
                        <View style={styles.header}>
                            <TouchableOpacity
                                style={styles.backButton}
                                activeOpacity={0.8}
                                onPress={() => router.back()}
                            >
                                <Ionicons
                                    name="chevron-back"
                                    size={28}
                                    color="#111827"
                                />
                            </TouchableOpacity>

                            <Text style={styles.headerTitle}>
                                스크랩한 여권
                            </Text>

                            <View style={styles.headerRightBlank}/>
                        </View>

                        <View style={styles.searchSection}>
                            <View style={styles.searchInputBox}>
                                <TextInput
                                    value={searchText}
                                    onChangeText={setSearchText}
                                    placeholder="찾고 싶은 여권을 검색해 보세요!"
                                    placeholderTextColor="#D6DEEA"
                                    style={styles.searchInput}
                                    returnKeyType="search"
                                    onSubmitEditing={handleSearchSubmit}
                                />

                                {searchText.length > 0 && (
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => setSearchText("")}
                                    >
                                        <Ionicons
                                            name="close-circle"
                                            size={20}
                                            color="#D6DEEA"
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <TouchableOpacity
                                style={styles.searchButton}
                                activeOpacity={0.8}
                                onPress={handleSearchSubmit}
                            >
                                <Ionicons
                                    name="search"
                                    size={22}
                                    color="#FFFFFF"
                                />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.resultText}>
                            {searchText.trim()
                                ? `검색 결과 ${filteredScraps.length}개`
                                : `내가 저장한 여권 ${scraps.length}개`
                            }
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="bookmark-outline"
                            size={52}
                            color="#9CA3AF"
                        />
                        <Text style={styles.emptyTitle}>
                            스크랩한 여권이 없어요
                        </Text>
                        <Text style={styles.emptyDescription}>
                            마음에 드는 여권을 스크랩하면 여기에 모아볼 수 있어요.
                        </Text>
                    </View>
                }

                ListFooterComponent={
                    isFetchingMore ? (
                        <View style={styles.footerLoading}>
                            <ActivityIndicator size="small" color="#1A3A6B" />
                            <Text style={styles.footerText}>
                                더 불러오는 중...
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.footerSpace} />
                    )
                }
                />
        </View>
    )
}

const styles= StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFD",
    },
    content: {
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 120,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: "#F8FAFD",
        justifyContent: "center",
        alignItems: "center",
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 20,
        marginBottom: 18,
    },
    backButton: {
        width: 36,
        height: 36,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        color: "#111827",
        fontSize: 20,
        fontWeight: "600",
    },
    headerRightBlank: {
        width: 36,
        height: 36,
    },

    searchSection: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
    },
    searchInputBox: {
        flex: 1,
        height: 46,
        backgroundColor: "#1A3A6B",
        borderRadius: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
        paddingVertical: 0,
    },
    searchButton: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: "#1A3A6B",
        justifyContent: "center",
        alignItems: "center",
    },
    resultText: {
        color: "#6B7280",
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 14,
    },

    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 120,
        paddingHorizontal: 24,
    },
    emptyTitle: {
        color: "#111827",
        fontSize: 18,
        fontWeight: "800",
        marginTop: 14,
        marginBottom: 8,
    },
    emptyDescription: {
        color: "#6B7280",
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
    },
    footerLoading: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 20,
    },
    footerText: {
        color: "#6B7280",
        fontSize: 13,
        marginLeft: 8,
    },
    footerSpace: {
        height: 20,
    },
})
