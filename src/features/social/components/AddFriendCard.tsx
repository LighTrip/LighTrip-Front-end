import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { RecommendedFriend } from "../types/social.types";

const defaultProfile = require("../../../../assets/images/default_profile.png");

const getMutualFriendText = (
    mutualFriends?: {nickname: string}[]
) => {
    if (!mutualFriends || mutualFriends.length === 0) {
        return "함께 아는 친구 없음"
    }

    if (mutualFriends.length === 1) {
        return `${mutualFriends[0].nickname} 님과 함께`
    }

    return `${mutualFriends[0].nickname} 외 ${mutualFriends.length -1}명과 함께 `;
};

type AddFriendProps = {
    friend: RecommendedFriend;
    onAdd: (friend: RecommendedFriend) => void;
    onPress: (friend: RecommendedFriend) => void;
};

export default function AddFriendCard({friend, onAdd, onPress}: AddFriendProps) {
    return (
        <TouchableOpacity 
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => onPress(friend)}
        >
            <Image 
                source={
                    friend.profileImg
                        ? {uri: friend.profileImg}
                        : defaultProfile
                } style={styles.image} 
            />

            <View style={styles.info}>
                <Text style={styles.name}>{friend.nickname}</Text>
                <Text style={styles.stamp}>도장 {friend.passportCount ?? 0}개</Text>
                <Text style={styles.description}>
                    {getMutualFriendText(friend.mutualFriends)}
                </Text>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={() => onAdd(friend)}>
                <Text style={styles.addButtonText}>추가</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
    },
    image: {
        width: 60, 
        height: 60,
        borderRadius: 60,
        marginLeft: -10,
        marginRight: 15,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 15,
        fontWeight: "500",
        color: "#1E2939",
    },
    stamp: {
        fontSize: 12,
        color: "#4A5565",
        marginTop: 3,
    },
    description: {
        fontSize: 11,
        color: "#4A5565",
        marginTop: 2,
    },
    addButton: {
        width: 58,
        height: 35,
        borderRadius: 30,
        backgroundColor: "#1A3A6B",
        alignItems: "center",
        justifyContent: "center",
    },
    addButtonText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#FFFFFF",
    },

})