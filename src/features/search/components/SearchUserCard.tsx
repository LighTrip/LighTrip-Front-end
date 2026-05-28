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
                    <View style={styles.requestedButton}>
                        <Ionicons name="checkmark" size={22} color="#1A3A6B" />
                    </View>
                ) : (
                    <TouchableOpacity 
                        style={styles.addButton} 
                        onPress={() => onAddFriend(item.writerFriendCode)}
                    >
                        <Ionicons name="person-add-outline" size={20} color="#000000" />
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
    addButton: {
        marginTop: 35,
        marginRight: -5,
    },
    requestedButton: {
        marginTop: 35,
        marginRight: -5,
    }
})