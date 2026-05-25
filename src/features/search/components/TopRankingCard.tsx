import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";
import type { RankingUser } from "../types/ranking.types";

type TopRankingCardProps = {
    user: RankingUser;
};

export default function TopRankingCard({ user }: TopRankingCardProps) {

    const isFristRank = user.rank === 1;

    return (
        <View 
            style={[
                styles.topRankingCard,
                isFristRank && styles.firstRankingCard,
            ]}
        >
            <Text style={styles.medalText}>{getMedal(user.rank)}</Text>
            <Image
                source={
                    user.profileImageUrl
                        ? {uri : user.profileImageUrl}
                        : require("@/assets/images/default_profile.png")
                }
                style={styles.profileImage}
            />
            <Text style={styles.topRankingName} numberOfLines={1}>
                {user.nickname}
            </Text>

            <View style={styles.scoreRow}>
                <Ionicons name="flame-outline" size={12} color="#FFFFFF" />
                <Text style={styles.topRankingScore}>{user.score}</Text>
            </View>
        </View>
    );
}

function getMedal(rank: number) {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
}

const styles = StyleSheet.create({
    topRankingCard: {
        width: "31%",
        height: 132,
        backgroundColor: "#1A3A6B",
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
    },
    firstRankingCard: {
        height: 154,
    },
    medalText: {
        fontSize: 20,
        marginBottom: 4,
    },
    profileImage: {
        width: 45,
        height: 45,
        borderRadius: 21,
        backgroundColor: "#d9d9d9",
        borderWidth: 2,
        borderColor: "#FFFFFF",
        marginBottom: 6,
    },
    topRankingName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        marginBottom: 2,
    },
    scoreRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    topRankingScore: {
        fontSize: 12,
        color: "#FFFFFF",
        fontWeight: "500",
    },
});