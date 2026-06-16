import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { RankingUser } from "../types/ranking.types";

type RankingItemProps = {
    user: RankingUser;
    isMyRank?: boolean;
};

export default function RankingItem({ user, isMyRank = false }: RankingItemProps) {
    return (
        <View style={[styles.rankingItem, isMyRank && styles.myRankingItem]}>
            <View style={styles.rankCircle}>
                <Text style={styles.rankText}>{user.rank}</Text>
            </View>

            <View style={styles.rankingUserInfo}>
                <Text style={styles.rankingName} numberOfLines={1}>
                    {user.nickname}
                </Text>

                <View style={styles.rankingScoreRow}>
                    <Ionicons name="flame" size={12} color="#1A3A6B" />
                    <Text style={styles.rankingScoreText}>{user.score}</Text>
                </View>
            </View>

            {!isMyRank && user.rank <= 3 && (
                <View
                    style={[
                        styles.trophyCircle,
                        { backgroundColor: getTrophyBackgroundColor(user.rank) },
                    ]}
                >
                    <Text style={styles.trophyText}>🏆</Text>
                </View>
            )}
        </View>
    );
}

function getTrophyBackgroundColor(rank: number) {
    if (rank === 1) return "#FFD700";
    if (rank === 2) return "#C0C0C0";
    if (rank === 3) return "#CD7F32";
    return "#F3F3F3";
}

const styles = StyleSheet.create({
    rankingItem: {
        height: 82,
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        shadowColor: "#000000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    myRankingItem: {
        backgroundColor: "#E5ECFC",
    },
    rankCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1A3A6B",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    rankText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    rankingUserInfo: {
        flex: 1,
        marginLeft: 10,
    },
    rankingName: {
        fontSize: 16,
        fontWeight: "500",
        color: "#1A3A6B",
        marginBottom: 4,
    },
    rankingScoreRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    rankingScoreText: {
        marginLeft: 3,
        fontSize: 13,
        color: "#1A3A6B",
        fontWeight: "500",
    },
    trophyCircle: {
        width: 30,
        height: 30,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    trophyText: {
        fontSize: 15,
    },
});