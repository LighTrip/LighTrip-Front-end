import { FlatList, StyleSheet } from "react-native";
import { socialDummy } from "../data/socialDummy";
import type { Friend } from "../types/social.types";
import FriendCard from "./FriendCard";

export default function FriendGrid() {
    return (
    <FlatList<Friend>
        data={socialDummy}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => <FriendCard friend={item} />}
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