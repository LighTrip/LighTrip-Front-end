import { getPassportFeed } from "@/src/api/searchApi";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";
import type { PassportFeedItem } from "../types/passport.types";
import PassportActionButtons from "./PassportActionButtons";
import PassportFrame from "./PassportFrame";
import SearchUserCard from "./SearchUserCard";

// 둘러보기 메인 화면
export default function AllSearchContent() {

    // 친구 추가 메시지
    const [showAddMessage, setShowAddMessage] = useState(false);

    // 피드 조회
    const [feedList, setFeedList] = useState<PassportFeedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [hasNext, setHasNext] = useState(false);
    const [nextCursor, setNextCursor] = useState<number | null>(null);
    const [nextCursorScore, setNextCursorScore] = useState<number | null>(null);

    const [likeIds, setLikeIds] = useState<number[]>([]);
    const [scrappedIds, setScrappedIds] = useState<number[]>([]);

    // 친구 추가
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
                cursorScore: isNextPage ? nextCursorScore : null,
            });

            if (isNextPage) {
                setFeedList((prev) => [...prev, ...result.content]);
            } else {
                setFeedList(result.content);
            }

            setHasNext(result.hasNext);
            setNextCursor(result.nextCursor);
            setNextCursorScore(result.nextCursorScore);
        } catch (error) {
            console.log("피드 조회 에러:", error);

            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("피드 조회 중 오류가 발생했습니다.");
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
            return;
        }

        fetchFeed(true);
    };

    // 좋아요 
    const toggleLike = (id: number) => {
        setLikeIds((prev) =>
            prev.includes(id)
                ? prev.filter((likeId) => likeId !== id)
                : [...prev, id]
        );
    };

    // 스크랩
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
        );
    }

    if (errorMessage) {
        return (
            <View style={styles.centerBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
        );
    }

    if (feedList.length === 0) {
        return (
            <View style={styles.centerBox}>
                <Text style={styles.emptyText}>아직 표시할 피드가 없습니다.</Text>
            </View>
        );
    }

    return (
        <View style={styles.reelsContainer}>
            <FlatList
                data={feedList}
                keyExtractor={(item) => String(item.passportId)}
                renderItem={({ item }) => (
                    <View style={styles.reelsPage}>
                        <View style={styles.card}>
                            <Image
                                source={require("@/assets/images/noise.png")}
                                style={styles.noiseBackground}
                                resizeMode="cover"
                            />

                            <View style={styles.cardContent}>
                                <SearchUserCard
                                    item={item}
                                    onAddFriend={handleAddFriend}
                                />

                                <View style={styles.passportDetailArea}>
                                    <PassportFrame item={item} />

                                    <PassportActionButtons
                                        isLiked={
                                            item.isLiked ||
                                            likeIds.includes(item.passportId)
                                        }
                                        isScrapped={
                                            item.isScrapped ||
                                            scrappedIds.includes(item.passportId)
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
                    <Text style={styles.addMessageText}>
                        친구 추가 요청을 보냈습니다.
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
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
    reelsContainer: {
        flex: 1,
        position: "relative",
    },
    reelsPage: {
        height: Dimensions.get("window").height - 150,
        paddingHorizontal: 20,
        paddingBottom: 24,
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
        flex: 1,
        position: "relative",
        zIndex: 1,
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
})