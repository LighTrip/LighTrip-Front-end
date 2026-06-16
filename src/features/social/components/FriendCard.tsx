import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Friend } from "../types/social.types";

type FriendCardProps = {
    friend: Friend;
    isSelected: boolean;
    onPress: () => void;
    onLongPress: () => void;
};

const defaultProfile = require("../../../../assets/images/default_profile.png");

const getMutualFriendText = (
    mutualFriends: {nickname: string}[]
) => {
    if (mutualFriends.length === 0) {
        return "함께 아는 친구 없음"
    }

    if (mutualFriends.length === 1) {
        return `${mutualFriends[0].nickname} 님과 함께`
    }
    return `${mutualFriends[0].nickname} 외 ${mutualFriends.length -1}명과 함께`;
};

export default function FriendCard({friend, isSelected, onPress, onLongPress}: FriendCardProps) {
    return(
        <TouchableOpacity
            activeOpacity={0.8}
            style={[
                styles.card,
                isSelected && styles.selectedCard,
            ]}
            onPress={onPress}
            onLongPress={onLongPress}
            delayLongPress={500}
        >
            <Image 
                source={
                    friend.profileImg
                        ? {uri: friend.profileImg}
                        : defaultProfile
                } 
                style={styles.profileImage} 
            />
            <Text style={styles.name} numberOfLines={1}>
                {friend.name}
            </Text>
            <Text style={styles.stampText}>
                도장 {friend.stampCount ?? 0}개
            </Text>
            <Text style={styles.togetherText} numberOfLines={1}>
                {getMutualFriendText(friend.mutualFriends)}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create ({
    card: {
        width: "46%",
        height: 190,
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        paddingHorizontal: 12,
    },
    selectedCard: {
        backgroundColor: "#C6C6C6",
    },
    profileImage: {
        width: 75,
        height: 75,
        borderRadius: 99,
        marginBottom: 8,
    },
    name: {
        width: "100%",
        textAlign: "center",
        fontSize: 15,
        fontWeight: "700",
        color: "#000000",
        marginBottom: 8,
    },
    stampText: {
        width: "100%",
        textAlign: "center",
        fontSize: 11,
        color: "#4A5565",
        marginBottom: 4,
    },
    togetherText: {
        width: "100%",
        textAlign: "center",
        fontSize: 10,
        color: "#6A7282",
    }
})