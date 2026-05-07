import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import { addFriendDummy } from "../data/addFriendDummy";
import { AddFriend } from "../types/social.types";
import AddFriendCard from "./AddFriendCard";

type AddFriendModalProps = {
    visible: boolean,
    onClose: () => void,
};

export default function AddFriendModal({visible, onClose}: AddFriendModalProps) {

    const [keyword, setKeyword] = useState("");

    const filteredFriends = useMemo(() => {
        const trimmedKeyword = keyword.trim();

        if(trimmedKeyword.length === 0) {
            return addFriendDummy;
        }

        return addFriendDummy.filter((friend) => {
            return(
                friend.id.includes(trimmedKeyword) || friend.phone.includes(trimmedKeyword)
            );
        });
    }, [keyword]);

    const handleAddFriend = (friend: AddFriend) => {
        Alert.alert(
            "친구 요청 완료!",
            `${friend.name}님에게 친구 요청을 보냈습니다.\n관련 정보는 마이페이지에서 확인할 수 있습니다.`
        );
    };

    return (
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
                    <FlatList  
                        style={styles.list}
                        data={filteredFriends}
                        keyExtractor={(item) => item.id}
                        renderItem={({item}) => (
                            <AddFriendCard friend={item} onAdd={handleAddFriend} />
                        )} 
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
                        }
                    />

                    <View style={styles.searchBox}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="친구 코드 또는 전화번호 입력"
                            placeholderTextColor="#d9d9d9"
                            value={keyword}
                            onChangeText={setKeyword}
                        />

                        <TouchableOpacity style={styles.searchButton}>
                            <Text style={styles.searchButtonText}>검색</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
        
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
})
