import { BASE_URL } from "@/src/api/config";
import { Ionicons } from "@expo/vector-icons";
import * as Securestore from "expo-secure-store";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddFriendModal from "../components/AddFriendModal";
import FriendDetailModal from "../components/FriendDetailModal";
import FriendGrid from "../components/FriendGrid";
import SocialSearchBar from "../components/SocialSearchBar";
import { Friend } from "../types/social.types";

type FriendApiItem = {
    friendId: number;
    userId: number;
    nickname: string;
    profileImg: string | null;
    friendCode: string;
    status: string;
    createdAt: string;
}

type FriendListResponse = {
    success: boolean;
    code: string;
    message: string;
    data: FriendApiItem[];
}

export default function SocialView() {
    const [keyword, setKeyword] = useState("");
    const [friends, setFriends] = useState<Friend[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    // 소셜 메인화면에서 사용자 선택
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
    // 친구 추가에서 선택
    const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);

    // 친구 목록 불러오기 API 연결
    const fetchFriends = async () => {
        const accessToken = await Securestore.getItemAsync("accessToken");

        try {
            setIsLoading(true);
            setErrorMessage("");

            console.log("친구 목록 요청 URL:", `${BASE_URL}/api/v1/friends`);

            const response = await fetch(`${BASE_URL}/api/v1/friends`, {
                method: "GET",
                headers : {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const data: FriendListResponse = await response.json();

            console.log("친구 목록 응답 상태:", response.status);
            console.log("친구 목록 응답 데이터:",data);

            if(!response.ok || !data.success) {
                throw new Error(data.message || "친구 목록 조회에 실패했습니다.")
            }

            const mappedFriends: Friend[] = data.data.map((item) => ({
                id: String(item.friendId),
                userId: item.userId,
                name: item.nickname,
                profileImg: item.profileImg,
                friendCode: item.friendCode,
                status: item.status,
                createdAt: item.createdAt,

                // 임시 처리
                stampCount: 0,
                passportCount: 0,
                together: "",
            }));

            setFriends(mappedFriends);
        }catch(error) {
            console.log("친구 목록 조회 에러:", error)
            setErrorMessage("친구 목록을 불러오지 못했습니다.");
        }finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchFriends();
    }, [])

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
                />
            )}

            {/*다른 사용자 여권 열람 바텀 시트*/}
            <FriendDetailModal
                visible={selectedFriend !== null}
                friend={selectedFriend}
                onClose={()=>setSelectedFriend(null)}
            />

            {/*친구 추가 바텀시트*/}
            <AddFriendModal
                visible={isAddFriendOpen}
                onClose={() => setIsAddFriendOpen(false)}
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
        marginTop: 20,
        paddingHorizontal: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
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
})