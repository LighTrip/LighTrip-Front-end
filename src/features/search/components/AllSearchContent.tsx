import { likePassport, unlikePassport } from "@/src/api/list/like.api";
import { scrapPassport, unscrapPassport } from "@/src/api/list/scrap.api";
import { getPassportFeed, requestFriend } from "@/src/api/searchApi";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import type { PassportFeedItem } from "../types/passport.types";
import PassportActionButtons from "./PassportActionButtons";
import PassportFrame from "./PassportFrame";
import SearchUserCard from "./SearchUserCard";

type AllSearchContentProps = {
    requestedFriendCodes: string[];
    setRequestedFriendCodes: React.Dispatch<React.SetStateAction<string[]>>;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - 48;

// 둘러보기 메인 화면
export default function AllSearchContent({
    requestedFriendCodes,
    setRequestedFriendCodes,
}: AllSearchContentProps) {

    // 친구 추가 관련 state
    const [showAddMessage, setShowAddMessage] = useState(false);
    const [addFriendMessage, setAddFriendMessage] = useState("");
    const [isRequestingFriend, setIsRequestingFriend] = useState(false);

    // 피드 조회 관련 state
    const [feedList, setFeedList] = useState<PassportFeedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    // 다음 페이지 로딩만 실패한 상태. 목록은 그대로 두고 재시도 수단만 띄운다.
    const [loadMoreFailed, setLoadMoreFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [listHeight, setListHeight] = useState(0);

    const [hasNext, setHasNext] = useState(false);
    const [nextCursor, setNextCursor] = useState<number | null>(null);
    const [nextCursorScore, setNextCursorScore] = useState<number | null>(null);

    // 좋아요/스크랩 관련 state
    const [likingPassportIds, setLikingPassportIds] = useState<number[]>([]);
    const [scrappingPassportIds, setScrappingPassportIds] = useState<number[]>([]);

    // 1. 친구 추가 API 연결
    const handleAddFriend = async (friendCode: string) => {
        if (isRequestingFriend) return;

        try {
            setIsRequestingFriend(true);

            await requestFriend(friendCode);

            setRequestedFriendCodes((prev) => 
                prev.includes(friendCode) ? prev : [...prev, friendCode]
            );

            setAddFriendMessage("친구 추가 요청을 보냈습니다.")
            setShowAddMessage(true);
        } catch(error) {
            console.log("친구 추가 요청 에러:", error);

            if(error instanceof Error) {
                setAddFriendMessage(error.message);
            } else {
                setAddFriendMessage("친구 추가 요청 중 오류가 발생했습니다.")
            }

            setShowAddMessage(true);
        } finally {
            setIsRequestingFriend(false);

            setTimeout(() => {
                setShowAddMessage(false);
            }, 2000);
        }
    };

    // 2. 릴스 피드 조회 API 연결
    const fetchFeed = async (isNextPage = false) => {
        try {
            if (isNextPage) {
                setIsFetchingMore(true);
            } else {
                setIsLoading(true);
                setErrorMessage("");
            }

            setLoadMoreFailed(false);

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

            // 다음 페이지 요청이 실패했다고 보고 있던 목록까지 지우면 안 된다.
            // 에러 화면으로 갈아치우면 스크롤 위치도 잃고 복구할 방법도 없다.
            if (isNextPage) {
                setLoadMoreFailed(true);
                return;
            }

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
        // 실패 직후 자동 재요청이 반복되지 않게 한다. 사용자가 버튼으로 다시 시도한다.
        if (loadMoreFailed) return;

        if (isLoading || isFetchingMore || !hasNext) {
            return;
        }

        fetchFeed(true);
    };

    // 3. 좋아요 
    const toggleLike = async (passportId: number) => {
        if (likingPassportIds.includes(passportId)) return;

        const targetItem = feedList.find(
            (item) => item.passportId === passportId
        );

        if (!targetItem) return;

        const previousIsLiked = targetItem.isLiked;
        const previousLikeCount = targetItem.likeCount;

        try {
            setLikingPassportIds((prev) => [...prev, passportId]);

            // 화면에 먼저 반영
            setFeedList((prev) =>
                prev.map((item) => 
                    item.passportId === passportId
                        ? {
                            ...item,
                            isLiked: !item.isLiked,
                            likeCount: item.isLiked
                                ? Math.max(item.likeCount - 1, 0)
                                : item.likeCount +1
                        }
                        : item
                )
            );

            // 실제 좋아요 API 호출
            if (previousIsLiked) {
                // 좋아요 취소
                const response = await unlikePassport(passportId);

                console.log("좋아요 취소 성공:", {
                    passportId,
                    status: response.status,
                    data: response.data
                })

            } else { 
                // 좋아요 등록
                const response = await likePassport(passportId); 

                console.log("좋아요 등록 성공:", {
                    passportId,
                    status: response.status,
                    data: response.data
                })
            }
        }catch(error) {
            console.log("좋아요 처리 에러:", error);

            // 실패하면 원래 상태로 복구
            setFeedList((prev) =>
                prev.map((item) => 
                    item.passportId === passportId
                        ? {
                            ...item,
                            isLiked: previousIsLiked,
                            likeCount: previousLikeCount,
                        }
                        : item
                )
            )
        }finally {
            setLikingPassportIds((prev) =>
                prev.filter((id) => id !== passportId)
            )
        }
    };

    // 4. 스크랩
    const toggleScrap = async (passportId: number) => {

        if(scrappingPassportIds.includes(passportId)) return;

        const targetItem = feedList.find(
            (item) => item.passportId === passportId
        );

        if(!targetItem) return;

        const previousIsScrapped = targetItem.isScrapped;
        const previousScrapCount = targetItem.scrapCount;

        try {
            setScrappingPassportIds((prev) => [...prev, passportId]);

            // 화면에 먼저 반영
            setFeedList((prev) =>
                prev.map((item) =>
                    item.passportId === passportId
                        ? {
                            ...item,
                            isScrapped: !item.isScrapped,
                            scrapCount: item.isScrapped
                                ? Math.max(item.scrapCount -1, 0)
                                : item.scrapCount+1
                        }
                        : item
                )
            )

            // 실제 스크랩 API 호출
            if(previousIsScrapped) {
                const response = await unscrapPassport(passportId);

                console.log("스크랩 취소 성공:", {
                    passportId,
                    status: response.status,
                    data: response.data
                })
            } else {
                const response = await scrapPassport(passportId);

                console.log("스크랩 등록 성공:", {
                    passportId,
                    status: response.status,
                    data: response.data
                })
            }
        } catch(error: any) {
            console.log("스크랩 처리 에러:", error);

            // 실패하면 원래 상태로 복구
            setFeedList((prev) =>
                prev.map((item) => 
                    item.passportId === passportId
                        ? {
                            ...item,
                            isScrapped: previousIsScrapped,
                            scrapCount: previousScrapCount,
                        }
                        : item
                )
            )
        } finally {
            setScrappingPassportIds((prev) => 
                prev.filter((id) => id !== passportId)
            )
        }
    
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
        <View 
            style={styles.reelsContainer}
            onLayout={(event) => {
                setListHeight(event.nativeEvent.layout.height)
            }}
        >
            {listHeight > 0 && (
                <FlatList
                    data={feedList}
                    keyExtractor={(item) => String(item.passportId)}
                    renderItem={({ item }) => (
                        <View style={[styles.reelsPage, { height: listHeight }]}>
                            {/* <View style={styles.cardShadow}> */}
                            <View style={styles.card}>
                                <Image
                                    source={require("@/assets/images/noise.png")}
                                    style={styles.noiseBackground}
                                    resizeMode="cover"
                                />

                                <View style={styles.cardContent}>
                                    <View style={styles.userCardArea}>
                                        <SearchUserCard
                                            item={item}
                                            onAddFriend={handleAddFriend}
                                            isRequested={requestedFriendCodes.includes(item.writerFriendCode)}
                                        />
                                    </View>

                                    <View style={styles.passportDetailArea}>
                                        <PassportFrame item={item} />

                                        <PassportActionButtons
                                            isLiked={item.isLiked}
                                            isScrapped={item.isScrapped}
                                            isLiking={likingPassportIds.includes(item.passportId)}
                                            isScrapping={scrappingPassportIds.includes(item.passportId)}
                                            onPressLike={() => toggleLike(item.passportId)}
                                            onPressScrap={() => toggleScrap(item.passportId)}
                                        />
                                    </View>
                                </View>
                            </View>
                            {/* </View> */}
                        </View>
                    )}
                    pagingEnabled
                    snapToInterval={listHeight}
                    snapToAlignment="start"
                    decelerationRate="fast"
                    disableIntervalMomentum
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleEndReached}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        isFetchingMore ? (
                            <ActivityIndicator size="small" color="#1A3A6B" />
                        ) : loadMoreFailed ? (
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.retryMoreButton}
                                onPress={() => fetchFeed(true)}
                            >
                                <Text style={styles.retryMoreText}>
                                    불러오지 못했어요. 다시 시도
                                </Text>
                            </TouchableOpacity>
                        ) : null
                    }
                />
            )}

            {showAddMessage && (
                <View style={styles.addMessageBox}>
                    <Text style={styles.addMessageText}>
                        {addFriendMessage}
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
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    // cardShadow: {
    //     width: CARD_WIDTH,
    //     height: 700,
    //     top: 10,
    //     borderRadius: 16,
    //     shadowColor: "#707070",
    //     // shadowOpacity: 0.3,
    //     // shadowRadius: 6,
    //     elevation: 5,
    // },
    card: {
        width: CARD_WIDTH,
        height: 700,
        borderRadius: 16,
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
    userCardArea: {
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    passportDetailArea: {
        position: "relative",
        width: "100%",
        height: "82%",
        top: 10,
        borderRadius: 16,
        overflow: "hidden",
        zIndex: 1,
    },
    retryMoreButton: {
        alignSelf: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    retryMoreText: {
        color: "#1A3A6B",
        fontSize: 13,
        fontWeight: "700",
        textDecorationLine: "underline",
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