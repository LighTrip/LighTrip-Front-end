import { getPendingFriends, respondFriendRequest } from "@/src/api/profileApi";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { PendingFriend } from "../types/profile.types";

type FriendManageModalProps = {
    visible: boolean;
    onClose: () => void;
}

type FriendRequest = {
    id: string;
    name: string;
    userId: string;
    location: string;
    profileImg: string | null;
}

export default function FriendManageModal ({
    visible,
    onClose
} : FriendManageModalProps ) {

    const [keyword, setKeyword] = useState("");
    const [requests, setRequests] = useState<PendingFriend[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [processingFriendId, setProcessingFriendId] = useState<number | null>(null);

    // 받은 친구 요청 목록 조회회
    const fetchPendingFriends = async () => {
        try {
            setIsLoading(true);

            const data = await getPendingFriends();
            setRequests(data);
        }catch(error) {
            console.log("받은 친구 요청 목록 조회 에러:", error);
        }finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if(visible) {
            fetchPendingFriends();
        }
    }, [visible]);

    // 친구 검색
    const filteredRequests = useMemo(() => {
        const trimmedKeyword = keyword.trim();

        if(trimmedKeyword.length === 0) {
            return requests;
        }

        return requests.filter((friend) => {
            return (
                String(friend.userId).includes(trimmedKeyword)
            );
        });
    },[keyword, requests])

    const handleSearchFriend = () => {
        console.log("친구 검색:", keyword)
    };

    // 친구 요청 수락
    const handleAccept = async (friend: PendingFriend) => {
        try {
            setProcessingFriendId(friend.friendId);
            
            await respondFriendRequest(friend.friendId, "ACCEPT");

            setRequests((prev) =>
                prev.filter((request) => request.friendId !== friend.friendId) 
            );

            Alert.alert("친구 요청 수락", "친구 요청을 수락했습니다.")
        } catch(error) {
            console.log("친구 요청 수락 에러:",error)

            Alert.alert(
                "수락 실패",
                error instanceof Error
                    ? error.message
                    :"친구 요청 수락 중 문제가 발생했습니다."
            )
        }finally {
            setProcessingFriendId(null);
        }
    };

    // 친구 요청 거절
    const handleReject = async (friend: PendingFriend) => {
        try {
            setProcessingFriendId(friend.friendId);

            await respondFriendRequest(friend.friendId, "REJECT");

            setRequests((prev) =>
                prev.filter((request) => request.friendId !== friend.friendId)
            )

            Alert.alert("친구 요청 거절", "친구 요청을 거절했습니다.")
        }catch(error) {
            console.log("친구 요청 거절 에러", error)

            Alert.alert(
                "거절 실패",
                error instanceof Error
                    ? error.message
                    :"친구 요청 거절절 중 문제가 발생했습니다."
            )
        }finally {
            setProcessingFriendId(null);
        }
    };

    return(
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalBox}>
                    {/*상단 제목*/}
                    <View style={styles.header}>
                        <Text style={styles.title}>친구 관리</Text>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={onClose}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={22} color="#333333" />
                        </TouchableOpacity>
                    </View>

                    {/*검색 영역*/}
                    <View style={styles.searchSection}>
                        <Text style={styles.sectionTitle}>
                            유저의 고유번호(#)로 검색
                        </Text>

                        <View style={styles.searchRow}>
                            <View style={styles.searchInputBox}>
                                <Ionicons
                                    name="search"
                                    size={18}
                                    color="#1A3A6B"
                                    style={styles.searchIcon}
                                />

                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="#12345"
                                    placeholderTextColor="#1A3A6B"
                                    value={keyword}
                                    onChangeText={setKeyword}
                                />
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.searchButton}
                                onPress={handleSearchFriend}
                            >
                                <Text style={styles.searchButtonText}>검색</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/*나에게로 온 요청*/}
                    <Text style={styles.requestTitle}>나에게 온 요청</Text>

                    {isLoading ? (
                        <View style={styles.loadingBox}>
                            <ActivityIndicator size="small" color="#1A3A6B" />
                            <Text style={styles.loadingText}>요청 목록을 불러오는 중입니다.</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredRequests}
                            keyExtractor={(item) => String(item.userId)}
                            style={styles.requestList}
                            contentContainerStyle={styles.requestListContent}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled={true}
                            ListEmptyComponent={
                                <View style={styles.emptyBox}>
                                    <Text style={styles.emptyText}>
                                        받은 친구 요청이 없습니다.
                                    </Text>
                                </View>
                            }
                            renderItem={({item}) => (
                                <View style={styles.requestCard}>
                                    <View style={styles.friendInfoRow}>
                                        <View style={styles.profileCircle}>
                                            {item.profileImg ? (
                                                <Image
                                                    source={{uri: item.profileImg}}
                                                    style={styles.profileImage}
                                                />
                                            ) : (
                                                <Ionicons
                                                    name="person"
                                                    size={22}
                                                    color="#FFFFFF"
                                                />
                                            )}
                                        </View>

                                        <View style={styles.friendTextBox}>
                                            <Text style={styles.friendName}>
                                                {item.nickname}{" "}
                                                <Text style={styles.friendId}>
                                                    #{item.userId}
                                                </Text>
                                            </Text>

                                            <View style={styles.locationRow}>
                                                <Ionicons
                                                    name="location-outline"
                                                    size={13}
                                                    color="#A0A0A0"
                                                />
                                                <Text style={styles.friendLocation}>
                                                    {item.location}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/*친구 요청 수락/거절 버튼*/}
                                    <View style={styles.buttonRow}>
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            style={[
                                                styles.acceptButton,
                                                processingFriendId === item.friendId && styles.disabledButton,
                                            ]}
                                            disabled={processingFriendId === item.friendId}
                                            onPress={() => handleAccept(item)}
                                        >
                                            <Text style={styles.acceptButtonText}>
                                                {processingFriendId === item.friendId ? "처리 중" : "수락"}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            style={[
                                                styles.rejectButton,
                                                processingFriendId === item.friendId && styles.disabledButton,
                                            ]}
                                            disabled={processingFriendId === item.friendId}
                                            onPress={() => handleReject(item)}
                                        >
                                            <Text style={styles.rejectButtonText}>
                                                {processingFriendId === item.friendId ? "처리 중" : "거절"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        />
                        )}
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create ({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 18,
    },
    modalBox: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 18,

        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 8,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },

    title: {
        fontSize: 24,
        color: "#000000",
        fontWeight: "700"
    },
    closeButton: {
        width: 28,
        height: 28,
        justifyContent: "center",
        alignItems: "center",
    },
    searchSection: {
        marginBottom: 18,
    },
    sectionTitle: {
        color: "#1A3A6B",
        fontSize: 14,
        marginBottom: 8,
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    searchInputBox: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderRadius: 14,
        borderColor: "#1A3A6B",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        backgroundColor: "#FFFFFF",
    },
    searchIcon: {
        marginRight: 6,
    },
    searchInput: {
        flex: 1,
        color: "#1A3A6B",
        fontSize: 15,
        paddingVertical: 0,
    },
    searchButton: {
        width: 62,
        height: 48,
        borderRadius: 14,
        backgroundColor: "#1A3A6B",
        justifyContent: "center",
        alignItems: "center",
    },
    searchButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
    },
    requestTitle: {
        color: "#1A3A6B",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 10,
    },
    requestList: {
        maxHeight: 320,
        gap: 10,
    },
    requestListContent: {
        gap: 10,
        paddingBottom: 4,
    },
    requestCard: {
        backgroundColor: "#F3F5F7",
        borderRadius: 14,
        paddingHorizontal: 13,
        paddingVertical: 12,
    },
    friendInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    profileCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#d9d9d9",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
        overflow: "hidden",
    },
    profileImage: {
        width: "100%",
        height: "100%",
    },
    friendTextBox: {
        flex: 1,
    },
    friendName: {
        color: "#000000",
        fontSize: 15,
        marginBottom: 3,
        fontWeight: "500",
    },
    friendId: {
        color: "#A0A0A0",
        fontSize: 13,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    friendLocation: {
        color: "#A0A0A0",
        fontSize: 13,
        marginBottom: 2,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 8,
    },
    acceptButton: {
        flex: 1,
        height: 36,
        borderRadius: 17,
        backgroundColor: "#1A3A6B",
        justifyContent: "center",
        alignItems: "center",
    },
    acceptButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "500",
    },
    rejectButton: {
        flex: 1,
        height: 36,
        borderRadius: 17,
        backgroundColor: "#DBDDDF",
        justifyContent: "center",
        alignItems: "center",
    },
    rejectButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "500",
    },
    emptyBox: {
        height: 100,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F0F2F5",
        borderRadius: 12,
    },
    emptyText: {
        color: "#777777",
        fontSize: 13,
        fontWeight: "600",
    },
    loadingBox: {
        height: 120,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F0F2F5",
        borderRadius: 12, 
    },
    loadingText: {
        marginTop: 8,
        color: "#777777",
        fontSize: 13,
        fontWeight: "600",
    },
    disabledButton: {
        opacity: 0.6,
    },
})