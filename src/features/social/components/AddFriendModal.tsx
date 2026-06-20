import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import {
    getPublicUserProfile,
    getRecommendedFriends,
    requestFriend,
    searchFriendByCode
} from "@/src/api/socialApi";
import { PublicUserProfile, RecommendedFriend } from "../types/social.types";
import AddFriendCard from "./AddFriendCard";
import PublicUserProfileModal from "./PublicUserProfileModal";

const getRecommendedFriendKey = (item: RecommendedFriend, index: number) => {
    if (item.friendId !== null && item.friendId !== undefined) {
        return `friend-${item.friendId}`;
    }

    if (item.userId !== null && item.userId !== undefined) {
        return `user-${item.userId}`;
    }

    if (item.friendCode) {
        return `code-${item.friendCode}`;
    }

    return `recommended-${index}`;
};

const getRecommendedFriendRequestKey = (item: RecommendedFriend) => {
    if (item.userId !== null && item.userId !== undefined) {
        return `user-${item.userId}`;
    }

    if (item.friendCode) {
        return `code-${item.friendCode}`;
    }

    return null;
};

const applyRequestedStatus = (
    friends: RecommendedFriend[],
    requestedFriendKeys: Set<string>,
) =>
    friends.map((friend) => {
        const requestKey = getRecommendedFriendRequestKey(friend);

        return requestKey && requestedFriendKeys.has(requestKey)
            ? { ...friend, status: "PENDING" }
            : friend;
    });

type AddFriendModalProps = {
    visible: boolean,
    onClose: () => void;
    onFriendRequestSuccess?: () => void;
};

export default function AddFriendModal({visible, onClose, onFriendRequestSuccess}: AddFriendModalProps) {

    const [keyword, setKeyword] = useState("");
    const [friends, setFriends] = useState<RecommendedFriend[]>([]);
    const [recommendedFriends, setRecommendedFriends] = useState<RecommendedFriend[]>([]);
    const [requestedFriendKeys, setRequestedFriendKeys] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [selectedUser, setSelectedUser] = useState<PublicUserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);

    const filterRecommendedFriendsByNickname = (
        text: string,
        sourceFriends = recommendedFriends,
    ) => {
        const trimmedText = text.trim().toLowerCase();

        if (trimmedText.length === 0) {
            return applyRequestedStatus(sourceFriends, requestedFriendKeys);
        }

        return applyRequestedStatus(
            sourceFriends.filter((friend) =>
                friend.nickname
                    ?.toLowerCase()
                    .includes(trimmedText)
            ),
            requestedFriendKeys,
        );
    };

    // 1. ?곕뗄荑?燁살뮄??筌뤴뫖以?獄쏆룇釉??븍┛ 
    const fetchRecommendedFriends = async (
        nextRequestedFriendKeys = requestedFriendKeys,
    ) => {

        try {
            setLoading(true);
            setErrorMessage("");

            const nextRecommendedFriends = await getRecommendedFriends();
            const friendsWithRequestedStatus = applyRequestedStatus(
                nextRecommendedFriends,
                nextRequestedFriendKeys,
            );

            setRecommendedFriends(friendsWithRequestedStatus);
            setFriends(filterRecommendedFriendsByNickname(keyword, friendsWithRequestedStatus));
        }catch(error) {
            console.log("?곕뗄荑?燁살뮄??筌뤴뫖以?鈺곌퀬???癒?쑎:", error);
            setErrorMessage("?곕뗄荑?燁살뮄??筌뤴뫖以???븍뜄???? 筌륁궢六??щ빍??");
        }finally {
            setLoading(false);
        }
    };

    useEffect (() => {
        if(!visible) return;

        setKeyword("");
        fetchRecommendedFriends();
    }, [visible]);

    // 2. 燁살뮄?꾥굜遺얜굡嚥?野꺜??
    const handleSearchFriends = async () => {
        const trimmedKeyword = keyword.trim();

        if(trimmedKeyword.length === 0) {
            setErrorMessage("燁살뮄???꾨뗀諭띄몴???낆젾??곻폒?紐꾩뒄.");
            fetchRecommendedFriends();
            return;
        }

        try {
            setLoading(true);
            setErrorMessage("");

            const nicknameMatches = recommendedFriends.filter((friend) =>
                friend.nickname
                    ?.toLowerCase()
                    .includes(trimmedKeyword.toLowerCase())
            );

            if (nicknameMatches.length > 0) {
                setFriends(applyRequestedStatus(nicknameMatches, requestedFriendKeys));
                return;
            }

            const searchedFriend = await searchFriendByCode(trimmedKeyword);
            setFriends(applyRequestedStatus([searchedFriend], requestedFriendKeys))
        }catch (error) {
            console.log("燁살뮄???꾨뗀諭?野꺜???癒?쑎:", error);
            setFriends([]);
            setErrorMessage("野꺜??野껉퀗?드첎? ??곷뮸??덈뼄.");
        }finally {
            setLoading(false);
        }
    };

    // 2-1. 野꺜??깃갯 ??쑴???????쇰뻻 ?곕뗄荑?燁살뮄??筌뤴뫖以?癰귣똻??袁⑥쨯
    const handleChangeKeyword = (text: string) => {
        setKeyword(text);
        setErrorMessage("");

        if(text.trim().length === 0) {
            setFriends(applyRequestedStatus(recommendedFriends, requestedFriendKeys));
            return;
        }

        setFriends(filterRecommendedFriendsByNickname(text));
    }

    // 3. 燁살뮄???곕떽?
    const handleAddFriend = async (friend: RecommendedFriend) => {
    
        try {
            console.log("癰귣?沅?燁살뮄???꾨뗀諭?", friend.friendCode);

            await requestFriend(friend.friendCode);

            const requestKey = getRecommendedFriendRequestKey(friend);
            const nextRequestedFriendKeys = new Set(requestedFriendKeys);

            if (requestKey) {
                nextRequestedFriendKeys.add(requestKey);
                setRequestedFriendKeys(nextRequestedFriendKeys);
            }

            setFriends((currentFriends) =>
                currentFriends.map((currentFriend) =>
                    currentFriend.userId === friend.userId ||
                    currentFriend.friendCode === friend.friendCode
                        ? { ...currentFriend, status: "PENDING" }
                        : currentFriend
                )
            );

            setRecommendedFriends((currentFriends) =>
                currentFriends.map((currentFriend) =>
                    currentFriend.userId === friend.userId ||
                    currentFriend.friendCode === friend.friendCode
                        ? { ...currentFriend, status: "PENDING" }
                        : currentFriend
                )
            );

            Alert.alert(
                "燁살뮄???遺욧퍕 ?袁⑥┷!",
                `${friend.nickname}??뤿퓠野?燁살뮄???遺욧퍕??癰귣?源??щ빍??`
            );

            // 燁살뮄???遺욧퍕 ?源껊궗 ???곕뗄荑?燁살뮄??筌뤴뫖以???쇰뻻 ?븍뜄???븍┛
            fetchRecommendedFriends(nextRequestedFriendKeys);

            onFriendRequestSuccess?.();
        } catch(error) {
            console.log("燁살뮄???遺욧퍕 ?癒?쑎:", error)

            if(error instanceof Error) {
                Alert.alert("燁살뮄???遺욧퍕 ??쎈솭", error.message)
            }else {
                Alert.alert("燁살뮄???遺욧퍕 ??쎈솭", "??????용뮉 ??살첒揶쎛 獄쏆뮇源??됰뮸??덈뼄.")
            }
        }
    };

    // 4. ?⑤벀而??袁⑥쨮??鈺곌퀬??
    const handlePressFriendCard = async (friend: RecommendedFriend) => {
        try {
            setProfileLoading(true);

            console.log("鈺곌퀬????????userId:", friend.userId);

            const profile = await getPublicUserProfile(friend.userId);
            setSelectedUser(profile);
        }catch(error) {
            console.log("?⑤벀而??袁⑥쨮??鈺곌퀬???癒?쑎:", error);

            if(error instanceof Error) {
                Alert.alert("?袁⑥쨮??鈺곌퀬????쎈솭:", error.message);
            } else {
                Alert.alert("?袁⑥쨮??鈺곌퀬????쎈솭", "??????용뮉 ??살첒揶쎛 獄쏆뮇源??됰뮸??덈뼄.")
            }
        } finally {
            setProfileLoading(false);
        }
    }

    return (
        <>
        <Modal
            visible={visible}
            transparent
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={0.8}
                onPress={onClose}
            />

            <View style={styles.bottomSheet}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>친구 추가</Text>
                        <Text style={styles.subTitle}>추천 친구 목록</Text>
                    </View>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    {loading ? (
                        <View style={styles.centerBox}>
                            <ActivityIndicator size="large" color="#1A3A6B" />
                            <Text style={styles.emptyText}>추천 친구 목록을 불러오는 중입니다.</Text>
                        </View>
                    ) : (
                        <FlatList  
                            style={styles.list}
                            data={friends}
                            keyExtractor={getRecommendedFriendKey}
                            renderItem={({item}) => (
                                <AddFriendCard 
                                    friend={item} 
                                    onAdd={handleAddFriend}
                                    onPress={handlePressFriendCard} 
                                />
                            )} 
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>{errorMessage || "검색 결과가 없습니다."}</Text>
                            }
                        />
                    )}

                    <View style={styles.searchBox}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="닉네임 또는 친구 코드 입력"
                            placeholderTextColor="#d9d9d9"
                            value={keyword}
                            onChangeText={handleChangeKeyword}
                            onSubmitEditing={handleSearchFriends}
                            returnKeyType="search"
                        />

                        <TouchableOpacity 
                            style={styles.searchButton}
                            onPress={handleSearchFriends}
                        >
                            <Text style={styles.searchButtonText}>검색</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>

        <PublicUserProfileModal
            visible={selectedUser !== null}
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
        />
        </>
        
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.35)"
    },
    bottomSheet: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: "hidden",
        height: "72%",
    },
    header: {
        backgroundColor: "#1A3A6B",
        paddingHorizontal: 20,
        paddingTop: 22,
        paddingBottom: 18,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    subTitle: {
        fontSize: 14,
        color: "#FFFFFF",
        marginTop: 8,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        flex: 1,
        paddingHorizontal: 18,
        paddingTop: 16,
        paddingBottom: 14,
    },
    list: {
        flex: 1,
    },
    emptyText: {
        textAlign: "center",
        color: "#777777",
        marginVertical: 24,
    },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#D1D5DC",
        borderRadius: 24,
        paddingLeft: 12,
        marginTop: 5,
        backgroundColor: "#FFFFFF",
        height: 42,
    },
    searchInput: {
        flex: 1,
        height: 44,
        fontSize: 16,
        color: "#000000",
    },
    searchButton: {
        backgroundColor: "#1A3A6B",
        paddingHorizontal: 18,
        width: 60,
        height: 40,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    searchButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
    },
    centerBox: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
})
