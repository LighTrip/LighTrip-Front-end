import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { RankingUser } from "../types/ranking.types";

type TopRankingCardProps = {
    user: RankingUser;
};

export default function TopRankingCard({ user }: TopRankingCardProps) {
    return (
        <View style={styles.topRankingCard}>
            <Text style={styles.medalText}>{getMedal(user.rank)}</Text>
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
        height: 120,
        backgroundColor: "#1A3A6B",
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
    },
    medalText: {
        fontSize: 24,
        marginBottom: 10,
    },
    topRankingName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
        marginBottom: 6,
        textAlign: "center",
        maxWidth: "100%",
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