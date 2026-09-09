import { BlockedUser, getMyBlocks, unblockUser } from "@/src/api/block/block.api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PAGE_SIZE = 20;

const formatBlockedAt = (blockedAt: string) => {
    const date = new Date(blockedAt);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    return `${yyyy}.${mm}.${dd} 차단`;
};

export default function BlockListScreen() {
    const router = useRouter();

    const [blocks, setBlocks] = useState<BlockedUser[]>([]);
    const [cursor, setCursor] = useState<number | null>(null);
    const [hasNext, setHasNext] = useState(true);
    const [unblockingIds, setUnblockingIds] = useState<number[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const subscription = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                router.replace("/profile" as any);
                return true;
            },
        );

        return () => subscription.remove();
    }, [router]);

    // 차단 목록 조회
    const fetchBlocks = async ({
        isInitial = false,
        isRefresh = false,
    }: {
        isInitial?: boolean;
        isRefresh?: boolean;
    }) => {
        try {
            if (isInitial) {
                setIsLoading(true);
            }

            if (isRefresh) {
                setIsRefreshing(true);
            }

            const response = await getMyBlocks({ size: PAGE_SIZE });

            console.log("내 차단 목록 조회 응답:", response.data);

            const result = response.data;

            if (!result.success) {
                throw new Error(result.message || "차단 목록 조회 실패");
            }

            setBlocks(result.data.content);
            setCursor(result.data.nextCursor);
            setHasNext(result.data.hasNext);
        } catch (error) {
            console.log("차단 목록 조회 에러:", error);

            Alert.alert(
                "차단 목록 조회 실패",
                error instanceof Error
                    ? error.message
                    : "차단 목록을 불러오는 중 문제가 발생했습니다.",
            );
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // 차단 목록 추가 조회
    const fetchMoreBlocks = async () => {
        if (!hasNext || isFetchingMore || cursor === undefined || cursor === null) {
            return;
        }

        try {
            setIsFetchingMore(true);

            const response = await getMyBlocks({ cursor, size: PAGE_SIZE });

            console.log("내 차단 다음 목록 조회 응답:", response.data);

            const result = response.data;

            if (!result.success) {
                throw new Error(result.message || "차단 다음 목록 조회 실패");
            }

            setBlocks((prev) => [...prev, ...result.data.content]);
            setCursor(result.data.nextCursor);
            setHasNext(result.data.hasNext);
        } catch (error) {
            console.log("차단 다음 목록 조회 에러:", error);
        } finally {
            setIsFetchingMore(false);
        }
    };

    useEffect(() => {
        fetchBlocks({ isInitial: true });
    }, []);

    // 차단 해제
    const handleUnblock = (item: BlockedUser) => {
        if (unblockingIds.includes(item.userId)) return;

        Alert.alert(
            "차단 해제",
            `${item.nickname}님을 차단 해제할까요?`,
            [
                { text: "취소", style: "cancel" },
                {
                    text: "차단 해제",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setUnblockingIds((prev) => [...prev, item.userId]);

                            await unblockUser(item.userId);

                            setBlocks((prev) =>
                                prev.filter((block) => block.userId !== item.userId),
                            );
                        } catch (error) {
                            console.log("차단 해제 에러:", error);

                            Alert.alert(
                                "차단 해제 실패",
                                error instanceof Error
                                    ? error.message
                                    : "차단 해제 중 문제가 발생했습니다.",
                            );
                        } finally {
                            setUnblockingIds((prev) =>
                                prev.filter((id) => id !== item.userId),
                            );
                        }
                    },
                },
            ],
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1A3A6B" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <FlatList
                data={blocks}
                keyExtractor={(item) => String(item.blockId)}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <Image
                            source={
                                item.profileImg
                                    ? { uri: item.profileImg }
                                    : require("@/assets/images/default_profile.png")
                            }
                            style={styles.profileImage}
                        />

                        <View style={styles.textArea}>
                            <Text style={styles.nickname}>{item.nickname}</Text>
                            <Text style={styles.blockedAt}>
                                {formatBlockedAt(item.blockedAt)}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.unblockButton}
                            activeOpacity={0.8}
                            disabled={unblockingIds.includes(item.userId)}
                            onPress={() => handleUnblock(item)}
                        >
                            {unblockingIds.includes(item.userId) ? (
                                <ActivityIndicator size="small" color="#1A3A6B" />
                            ) : (
                                <Text style={styles.unblockButtonText}>차단 해제</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                onEndReached={fetchMoreBlocks}
                onEndReachedThreshold={0.4}
                refreshing={isRefreshing}
                onRefresh={() => fetchBlocks({ isRefresh: true })}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            activeOpacity={0.8}
                            onPress={() => router.replace("/profile" as any)}
                        >
                            <Ionicons name="chevron-back" size={28} color="#111827" />
                        </TouchableOpacity>

                        <Text style={styles.headerTitle}>차단 목록</Text>

                        <View style={styles.headerRightBlank} />
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="ban-outline" size={52} color="#9CA3AF" />
                        <Text style={styles.emptyTitle}>차단한 사용자가 없어요</Text>
                        <Text style={styles.emptyDescription}>
                            차단한 사용자가 있다면 여기에서 모아볼 수 있어요.
                        </Text>
                    </View>
                }
                ListFooterComponent={
                    isFetchingMore ? (
                        <View style={styles.footerLoading}>
                            <ActivityIndicator size="small" color="#1A3A6B" />
                            <Text style={styles.footerText}>더 불러오는 중...</Text>
                        </View>
                    ) : (
                        <View style={styles.footerSpace} />
                    )
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
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

    row: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 12,
        shadowColor: "#707070",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    profileImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    textArea: {
        flex: 1,
        marginLeft: 12,
    },
    nickname: {
        fontSize: 16,
        fontWeight: "700",
        color: "#000000",
    },
    blockedAt: {
        marginTop: 4,
        fontSize: 12,
        color: "#737373",
    },
    unblockButton: {
        minWidth: 84,
        height: 34,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: "#1A3A6B",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
    },
    unblockButtonText: {
        color: "#1A3A6B",
        fontSize: 12,
        fontWeight: "700",
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
});
