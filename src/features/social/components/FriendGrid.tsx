import { FlatList, StyleSheet } from "react-native";
import type { Friend } from "../types/social.types";
import FriendCard from "./FriendCard";

type FriendGridProps = {
    friends: Friend[];
    selectedFriendId: string | null;
    onPressFriend: (friend: Friend) => void;
    onLongPressFriend: (Friend: Friend) => void;
};

export default function FriendGrid({friends, selectedFriendId, onPressFriend, onLongPressFriend}: FriendGridProps) {
    return (
    <FlatList<Friend>
        data={friends}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => 
        <FriendCard 
            friend={item} 
            isSelected={item.id === selectedFriendId}
            onPress={() => onPressFriend(item)}
            onLongPress={() => onLongPressFriend(item)}
        />}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
    />
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        paddingHorizontal: 15,
        paddingTop: 20,
        paddingBottom: 120,
    },
    row: {
        justifyContent: "space-between",
    },
});