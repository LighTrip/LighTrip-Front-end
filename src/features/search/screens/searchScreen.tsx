import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
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

import { passportDummy } from "../data/passportDummy";
import { rankingDummy } from "../data/searchDummy";
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

    const handleAddFriend = () => {
        setShowAddMessage(true);

        setTimeout(() => {
            setShowAddMessage(false);
        }, 2000);
    };

    // 좋아요 및 스크랩
    const [likeIds, setLikeIds] = useState<string[]>([]);
    const [scrappedIds, setScrapped] = useState<string[]>([]);

    const toggleLike = (id: string) => {
        setLikeIds((prev) =>
            prev.includes(id)
                ? prev.filter((likeId) => likeId !== id)
                : [...prev, id]
        );
    };

    const toggleScrap = (id: string) => {
        setScrapped((prev) => 
            prev.includes(id)
                ? prev.filter((scrappedId) => scrappedId !== id)
                : [...prev, id]
        );
    };

    return(
        <View style={styles.reelsContainer}>
            <FlatList
                data={passportDummy}
                keyExtractor= {(item) => item.id}
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
                                <SearchUserCard onAddFriend={handleAddFriend} />
                            
                                {/*여권 상세*/}
                                <View style={styles.passportDetailArea}>
                                    <PassportFrame item={item} />

                                    <PassportActionButtons
                                        isLiked={likeIds.includes(item.id)}
                                        isScrapped={scrappedIds.includes(item.id)}
                                        onPressLike={() => toggleLike(item.id)}
                                        onPressScrap={() => toggleScrap(item.id)}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
            )}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            decelerationRate="fast"
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