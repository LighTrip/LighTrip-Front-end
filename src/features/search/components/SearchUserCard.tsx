import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { PassportFeedItem } from "../types/passport.types";

type SearchUserCardProps = {
    item: PassportFeedItem;
    onAddFriend: (friendCode: string) => void;
    isRequested: boolean;
};

export default function SearchUserCard({item, onAddFriend, isRequested}: SearchUserCardProps) {
    return(
        <View style={styles.userInfoBox}>
        <View style={styles.userRow}>
            <Image
                source={
                    item.writerProfileImg
                        ? {uri: item.writerProfileImg}
                        : require("@/assets/images/default_profile.png")
                }
                style={styles.profileImage}
            />
            
            <View style={styles.userTextArea}>
                <View style={styles.nameRow}>
                    <Text style={styles.userName}>{item.writerNickname}</Text>
                    <Text style={styles.userId}>#{item.writerUserId}</Text>
                </View>
            
                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={12} color="#666667" />
                    <Text style={styles.locationText}>
                        {item.districtDisplayName || item.district}
                    </Text>
                </View>
            </View>
            
            {!item.isFriend && (
                isRequested ? (
                    // 아이콘만 있으면 친구가 된 건지 요청만 보낸 건지 알 수 없어서 글자를 함께 둔다.
                    <View style={styles.requestedButton}>
                        <Ionicons name="checkmark" size={13} color="#8A93A2" />
                        <Text style={styles.requestedButtonText}>요청 보냄</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.addButton}
                        onPress={() => onAddFriend(item.writerFriendCode)}
                    >
                        <Ionicons name="person-add" size={13} color="#FFFFFF" />
                        <Text style={styles.addButtonText}>친구추가</Text>
                    </TouchableOpacity>
                )
            )}
        </View>
    </View>
    )
}

const styles=StyleSheet.create({
    userInfoBox: {
        paddingLeft: 22,
        paddingRight: 22,
        paddingTop: 22,
        height: 90,
    },
    userRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 22,
    },
    profileImage: {
        height: 48,
        width: 48,
        borderRadius: 24,
    },
    userTextArea: {
        flex: 1,
        marginLeft: 12,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    userName: {
        fontSize: 20,
        fontWeight: "700",
        color: "#000000",
    },
    userId: {
        marginLeft: 5,
        fontSize: 14,
        color: "#666667",
        fontWeight: "500",
        marginTop: 5,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    locationText: {
        marginLeft: 2,
        fontSize: 10,
        color: "#666667",
    },
    // 두 상태의 크기를 같게 맞춰야 눌렀을 때 버튼이 튀지 않는다.
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        height: 32,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: "#1A3A6B",
    },
    addButtonText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "700",
    },
    requestedButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        height: 32,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#DDE3EC",
        backgroundColor: "#F2F5F9",
    },
    requestedButtonText: {
        color: "#8A93A2",
        fontSize: 12,
        fontWeight: "600",
    }
})