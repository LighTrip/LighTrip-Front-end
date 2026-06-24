import { deleteFriend, getFriends } from "@/src/api/socialApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddFriendModal from "../components/AddFriendModal";
import FriendDetailModal from "../components/FriendDetailModal";
import FriendGrid from "../components/FriendGrid";
import SocialSearchBar from "../components/SocialSearchBar";
import { Friend } from "../types/social.types";

export default function SocialView() {
    const [keyword, setKeyword] = useState("");
    const [friends, setFriends] = useState<Friend[]>([]);
    const [detailRefreshVersion, setDetailRefreshVersion] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    // 소셜 메인화면에서 사용자 선택
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
    // 친구 추가에서 선택
    const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);

    // 삭제할 친구
    const [deleteTargetFriend, setDeleteTargetFriend] = useState<Friend | null>(null);
    const [isDeleteFriend, setIsDeleteFriend] = useState(false);

    // 친구 목록 불러오기
    const fetchFriends = useCallback(async () => {

        try {
            setIsLoading(true);
            setErrorMessage("");

            const friendList = await getFriends();
            setFriends(friendList);
            setSelectedFriend((currentFriend) => {
                if (!currentFriend) return null;

                return friendList.find(
                    (friend) => friend.friendId === currentFriend.friendId
                ) ?? null;
            });
            setDetailRefreshVersion((version) => version + 1);
        }catch(error) {
            console.log("친구 목록 조회 에러:", error)
            setErrorMessage("친구 목록을 불러오지 못했습니다.");
        }finally {
            setIsLoading(false);
        }
    }, []);

    // 친구 삭제 호출
    const handleDeleteFriend = async () => {
        if(!deleteTargetFriend) return;

        try {
            setIsDeleteFriend(true);

            await deleteFriend(deleteTargetFriend.friendId);

            setFriends((prevFriends) =>
                prevFriends.filter(
                    (friend) => friend.friendId !== deleteTargetFriend.friendId
                )
            );

            if (selectedFriend?.friendId === deleteTargetFriend.friendId) {
                setSelectedFriend(null);
            }

            setDeleteTargetFriend(null);
        } catch(error) {
            console.log("친구 삭제 에러:", error);
            Alert.alert("삭제 실패", "친구 삭제 중 문제가 발생했습니다.");
        } finally {
            setIsDeleteFriend(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchFriends();
        }, [fetchFriends])
    );

    const filteredFriends = useMemo(() => {
        const trimmedKeyword = keyword.trim();

        if (trimmedKeyword.length === 0) {
            return friends;
        }

        return friends.filter((friend) =>
            friend.name.includes(trimmedKeyword)
        );
    }, [keyword, friends]);

    return(
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>소셜</Text>

                {/*친구 추가*/}
                <TouchableOpacity 
                    activeOpacity={0.8} 
                    style={styles.addButton}
                    onPress={() => setIsAddFriendOpen(true)}
                >
                    <Ionicons name="person-add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/*검색 바*/}
            <SocialSearchBar value={keyword} onChangeText={setKeyword}/>

            {/*소셜 메인 화면*/}
            {isLoading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color="#1A3A6B" />
                    <Text style={styles.infoText}>친구 목록을 불러오는 중입니다.</Text>
                </View>
            ) : errorMessage ? (
                <View style={styles.centerBox}>
                    <Text style={styles.infoText}>{errorMessage}</Text>

                    <TouchableOpacity style={styles.retryButton} onPress={fetchFriends}>
                        <Text style={styles.retryText}>다시 시도</Text>
                    </TouchableOpacity>
                </View>
            ) : filteredFriends.length === 0 ? (
                <View style={styles.centerBox}>
                    <Text style={styles.infoText}>아직 추가한 친구가 없습니다.</Text>
                </View>
            ) : (
                <FriendGrid 
                    friends={filteredFriends}
                    selectedFriendId={selectedFriend?.id ?? null}
                    onPressFriend={(friend) => setSelectedFriend(friend)}
                    onLongPressFriend={(friend) => setDeleteTargetFriend(friend)}
                />
            )}

            {/*친구 삭제 확인 모달*/}
            <Modal
                visible={deleteTargetFriend !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setDeleteTargetFriend(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.deleteModal}>
                        <Text style={styles.deleteTitle}>친구를 삭제하시겠습니까?</Text>

                        <Text style={styles.deleteMessage}>
                            {deleteTargetFriend?.name}님을 친구 목록에서 삭제합니다.
                        </Text>

                        <View style={styles.deleteButtonRow}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setDeleteTargetFriend(null)}
                                disabled={isDeleteFriend}
                            >
                                <Text style={styles.cancelButtonText}>취소</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={handleDeleteFriend}
                                disabled={isDeleteFriend}
                            >
                                <Text style={styles.deleteButtonText}>
                                    {isDeleteFriend ? "삭제 중" : "삭제"}
                                </Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </View>

            </Modal>

            {/*다른 사용자 여권 열람 바텀 시트*/}
            <FriendDetailModal
                visible={selectedFriend !== null}
                friend={selectedFriend}
                refreshVersion={detailRefreshVersion}
                onClose={()=>setSelectedFriend(null)}
            />

            {/*친구 추가 바텀시트*/}
            <AddFriendModal
                visible={isAddFriendOpen}
                onClose={() => setIsAddFriendOpen(false)}
                onFriendRequestSuccess={fetchFriends}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFD",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    title: {
        color: "#000000",
        fontSize: 24,
        fontWeight: "700",
    },
    addButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#1A3A6B",
        alignItems: "center",
        justifyContent: "center",
    },
    centerBox: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    infoText: {
        marginTop: 12,
        fontSize: 14,
        color: "#6A7282",
    },
    retryButton: {
        marginTop: 14,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: "#1A3A6B",
    },
    retryText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    deleteModal: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingHorizontal: 22,
        paddingVertical: 24,
        alignItems: "center",
    },
    deleteTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 10,
    },
    deleteMessage: {
        fontSize: 14,
        color: "#6A7282",
        textAlign: "center",
        marginBottom: 24,
    },
    deleteButtonRow: {
        width: "100%",
        flexDirection: "row",
        gap: 10,
    },
    cancelButton: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#E5E7EB",
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
    },
    deleteButton: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#EF4444",
        alignItems: "center",
        justifyContent: "center",
    },
    deleteButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF"
    }
})
