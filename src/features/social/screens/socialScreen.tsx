import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FriendDetailModal from "../components/FriendDetailModal";
import FriendGrid from "../components/FriendGrid";
import SocialSearchBar from "../components/SocialSearchBar";
import { socialDummy } from "../data/socialDummy";
import { Friend } from "../types/social.types";

export default function SocialView() {
    const [keyword, setKeyword] = useState("");
    const filteredFriends = useMemo(() => {
        const trimmedKeyword = keyword.trim();

        if (trimmedKeyword.length === 0) {
            return socialDummy;
        }

        return socialDummy.filter((friend) =>
            friend.name.includes(trimmedKeyword)
        );
    }, [keyword])

    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

    return(
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>소셜</Text>

                <TouchableOpacity activeOpacity={0.8} style={styles.addButton}>
                    <Ionicons name="person-add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <SocialSearchBar value={keyword} onChangeText={setKeyword}/>

            <FriendGrid 
                friends={filteredFriends}
                selectedFriendId={selectedFriend?.id ?? null}
                onPressFriend={setSelectedFriend}
            />

            <FriendDetailModal
                visible={selectedFriend !== null}
                friend={selectedFriend}
                onClose={()=>setSelectedFriend(null)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFD",
    },
    header: {
        marginTop: 20,
        paddingHorizontal: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        color: "#000000",
        fontSize: 24,
        fontWeight: "700",
    },
    addButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#1A3A6B",
        alignItems: "center",
        justifyContent: "center",
    },
})