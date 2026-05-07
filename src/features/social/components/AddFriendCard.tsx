import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { AddFriend } from "../types/social.types";

type AddFriendProps = {
    friend: AddFriend;
    onAdd: (friend: AddFriend) => void;
};

export default function AddFriendCard({friend, onAdd}: AddFriendProps) {
    return (
        <View style={styles.card}>
            <Image source={friend.image} style={styles.image} />

            <View style={styles.info}>
                <Text style={styles.name}>{friend.name}</Text>
                <Text style={styles.stamp}>도장 {friend.stampCount}개</Text>
                <Text style={styles.description}>{friend.together}</Text>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={() => onAdd(friend)}>
                <Text style={styles.addButtonText}>추가</Text>
            </TouchableOpacity>
        </View>
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