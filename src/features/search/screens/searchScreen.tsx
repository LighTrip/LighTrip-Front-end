import { getPassportFeed } from "@/src/api/searchApi";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PassportActionButtons from "../components/PassportActionButtons";
import PassportFrame from "../components/PassportFrame";
import SearchToggle from "../components/SearchToggle";
import SearchUserCard from "../components/SearchUserCard";
import { rankingDummy } from "../data/searchDummy";
import type { PassportFeedItem } from "../types/passport.types";
import { RankingUser, SearchTab } from "../types/search.types";

export default function SearchView() {

    const [selectedTab, setSelectedTab] = useState<SearchTab>("all")

    return(
        <SafeAreaView style={styles.container}>
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
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <RankingContent />
                    </ScrollView>
                )}         
        </SafeAreaView>   
    )
}

/*둘러보기 메인 화면*/
function AllSearchContent() {

    // 친구 추가 메시지
    const [showAddMessage, setShowAddMessage] = useState(false);

    const [feedList, setFeedList] = useState<PassportFeedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [hasNext, setHasNext] = useState(false);
    const [nextCursor, setNextCursor] = useState<number | null>(null);
    const [nextCursorScore, setNextCursorScore] = useState<number | null>(null);

    const handleAddFriend = () => {
        setShowAddMessage(true);

        setTimeout(() => {
            setShowAddMessage(false);
        }, 2000);
    };

    // 릴스 피드 조회 API 연결
    const fetchFeed = async (isNextPage = false) => {
        try {
            if (isNextPage) {
                setIsFetchingMore(true);
            } else {
                setIsLoading(true);
                setErrorMessage("");
            }

            const result = await getPassportFeed({
                size: 10,
                cursor: isNextPage ? nextCursor : null,
                cursorScore: isNextPage ? nextCursorScore : null
            });

            if (isNextPage) {
                setFeedList((prev) => [...prev, ...result.content]);
            } else {
                setFeedList(result.content);
            }

            setHasNext(result.hasNext);
            setNextCursor(result.nextCursor);
            setNextCursorScore(result.nextCursorScore);
        } catch(error) {
            console.log("피드 조회 에러:", error);

            if(error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("피드 조회 중 오류가 발생했습니다.")
            }
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    const handleEndReached = () => {
        if (isLoading || isFetchingMore || !hasNext) {
            return
        }

        fetchFeed(true);
    };

    // 좋아요 및 스크랩
    const [likeIds, setLikeIds] = useState<number[]>([]);
    const [scrappedIds, setScrappedIds] = useState<number[]>([]);

    const toggleLike = (id: number) => {
        setLikeIds((prev) =>
            prev.includes(id)
                ? prev.filter((likeId) => likeId !== id)
                : [...prev, id]
        );
    };

    const toggleScrap = (id: number) => {
        setScrappedIds((prev) => 
            prev.includes(id)
                ? prev.filter((scrappedId) => scrappedId !== id)
                : [...prev, id]
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centerBox}>
                <ActivityIndicator size="large" color="#1A3A6B" />
            </View>
        )
    }

    if (errorMessage) {
        return (
            <View style={styles.centerBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
        )
    }

    if (feedList.length === 0) {
        return (
            <View style={styles.centerBox}>
                <Text style={styles.emptyText}>아직 표시할 피드가 없습니다.</Text>
            </View>
        )
    }

    return(
        <View style={styles.reelsContainer}>
            <FlatList
                data={feedList}
                keyExtractor= {(item) => String(item.passportId)}
                renderItem= {({item}) => (
                    <View style={styles.reelsPage}>
                        <View style={styles.card}>
                        <Image 
                                source={require("@/assets/images/noise.png")}
                                style={styles.noiseBackground}
                                resizeMode="cover"
                            />

                            <View style={styles.cardContent}>
                                {/*사용자 정보*/}
                                <SearchUserCard 
                                    item={item}
                                    onAddFriend={handleAddFriend} 
                                />
                            
                                {/*여권 상세*/}
                                <View style={styles.passportDetailArea}>
                                    <PassportFrame item={item} />

                                    <PassportActionButtons
                                        isLiked={item.isLiked || likeIds.includes(item.passportId)}
                                        isScrapped={
                                            item.isScrapped|| scrappedIds.includes(item.passportId)
                                        }
                                        onPressLike={() => toggleLike(item.passportId)}
                                        onPressScrap={() => toggleScrap(item.passportId)}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
            )}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            decelerationRate="fast"
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
                isFetchingMore ? (
                    <ActivityIndicator size="small" color="#1A3A6B" />
                ) : null
            }
        /> 

        {showAddMessage && (
            <View style={styles.addMessageBox}>
                <Text style={styles.addMessageText}>친구 추가 요청을 보냈습니다.</Text>
            </View>
        )}
    </View>
    );
}

/*랭킹 메인화면*/
function RankingContent() {

    const topThree = rankingDummy.slice(0, 3);
    const rankingList = rankingDummy;

    return(
        <View>
            <View style={styles.topRankingRow}>
                {topThree.map((user) => (
                    <TopRankingCard key={user.id} user={user} />
                ))}
            </View>

            <View style={styles.rankingList}>
                {rankingList.map((user) => (
                    <RankingItem key={user.id} user={user} />
                ))}
            </View>
        </View>
    )
}

/*랭킹 Top3*/
function TopRankingCard({user}: {user: RankingUser}) {
    return(
        <View style={styles.topRankingCard}>
            <Text style={styles.medalText}>{getMedal(user.rank)}</Text>
            <Text style={styles.topRankingName}>{user.name}</Text>

            <View style={styles.likeRow}>
                <Ionicons name="heart-outline" size={12} color="#ED3838" />
                <Text style={styles.topRankingLike}>{user.likeCount}개</Text>
            </View>
        </View>
    )
}

/*나머지 리스트*/
function RankingItem({user}: {user: RankingUser}) {
    return(
        <View style={styles.rankingItem}>
            <View style={styles.rankCircle}>
                <Text style={styles.rankText}>{user.rank}</Text>
            </View>

            <Image source={user.profileImage} style={styles.rankingProfileImage} />

            <View style={styles.rankingUserInfo}>
                <Text style={styles.rankingName}>{user.name}</Text>

                <View style={styles.rankingLikeRow}>
                    <Ionicons name="heart" size={12} color="#1A3A6B" />
                    <Text style={styles.rankingLikeText}>{user.likeCount}개</Text>
                </View>
            </View>

            {user.rank <= 3 && (
                <View 
                    style={[
                        styles.trophyCircle,
                        {backgroundColor: getTrophyBackgroundColor(user.rank)},
                        ]}
                >
                    <Text style={styles.trophyText}>{getTrophy(user.rank)}</Text>
                </View>
            )}
        </View>
    )
}

/*메달 얻는 함수*/
function getMedal(rank: number) {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
}

/*트로피 얻는 함수*/
function getTrophy(rank: number) {
    if (rank === 1) return "🏆";
    if (rank === 2) return "🏆";
    if (rank === 3) return "🏆";
    return "";
}

/*등수별 트로피 배경 색 얻는 함수*/
function getTrophyBackgroundColor(rank: number) {
    if (rank === 1) return "#FFD700"; 
    if (rank === 2) return "#C0C0C0";
    if (rank === 3) return "#CD7F32"; 
}

const styles = StyleSheet.create({
    // 둘러보기
    reelsContainer: {
        flex: 1,
        position: "relative",
    },
    reelsPage: {
        height: Dimensions.get("window").height - 150,
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    passportDetailArea: {
        flex: 1,
        position: "relative",
        width: "100%",
        marginTop: -8,
        borderRadius: 16,
        overflow: "hidden",

        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.14,
        shadowRadius: 5,
        elevation: 6,
        zIndex: 10,
    },
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
        paddingHorizontal: 20,
        paddingTop: 22,
    },
    title: {
        fontWeight: "700",
        color: "#000000",
        fontSize: 24
    },
    card: {
        flex: 1,
        position: "relative",
        width: "100%",
        backgroundColor: "#F8FAFD",
        borderRadius: 16,
        shadowColor: "#000000",
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
        overflow: "hidden",
    },
    cardContent: {
        flex: 1,
        position: "relative",
        zIndex: 1,
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
    addMessageBox: {
        position: "absolute",
        left: 40,
        right: 40,
        top: "45%",
        backgroundColor: "#1A3A6B",
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    addMessageText: {
        color: "#FFFFFF",
        fontSize: 14,
    },
    centerBox: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 14,
        color: "#ED3838",
        textAlign: "center",
    },
    emptyText: {
        fontSize: 14,
        color: "#666667",
        textAlign: "center",
    },

    // 랭킹
    // 1. 랭킹 메인화면 & Top3
    topRankingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 18,
    },
    topRankingCard: {
        width: "31%",
        height: 100,
        backgroundColor: "#1A3A6B",
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    medalText: {
        fontSize: 20,
        marginBottom: 4,   
    },
    topRankingName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        marginBottom: 2,
    },
    likeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    topRankingLike: {
        fontSize: 12,
        color: "#FFFFFF",
        fontWeight: "500",
    },

    // 2. 나머지 리스트
    rankingList: {
        gap: 12,
    },
    rankingItem: {
        height: 82,
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        shadowColor: "#000000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    rankCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1A3A6B",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12
    },
    rankText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    rankingProfileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#d9d9d9",
        borderWidth: 2,
        borderColor: "#1A3A6B",
        marginRight: 12,
    },
    rankingUserInfo: {
        flex: 1,
    },
    rankingName: {
        fontSize: 16,
        fontWeight: "500",
        color: "#1A3A6B",
        marginBottom: 4,
    },
    rankingLikeRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    rankingLikeText: {
        marginLeft: 3,
        fontSize: 13,
        color: "#1A3A6B",
        fontWeight: "500",
    },

    // 3. 트로피
    trophyCircle: {
        width: 30,
        height: 30,
        borderRadius: 20,
        backgroundColor: "#F3F3F3",
        alignItems: "center",
        justifyContent: "center",
    },
    trophyText: {
        fontSize: 15,
    },
});