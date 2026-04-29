import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Friend } from "../types/social.types";

type FriendCardProps = {
    friend: Friend;
};

export default function FriendCard({friend}: FriendCardProps) {
    return(
        <TouchableOpacity
            activeOpacity={0.8}
            style={[
                styles.card,
                friend.isSelected && styles.selectedCard,
            ]}
        >
            <Image source={friend.image} style={styles.profileImage} />
            <Text style={styles.name}>{friend.name}</Text>
            <Text style={styles.stampText}>도장{friend.stampCount}개</Text>
            <Text style={styles.togetherText}>{friend.together}</Text>
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
        fontSize: 15,
        fontWeight: "700",
        color: "#000000",
        marginBottom: 8,
    },
    stampText: {
        fontSize: 11,
        color: "#4A5565",
        marginBottom: 4,
    },
    togetherText: {
        fontSize: 10,
        color: "#6A7282",
    }
})