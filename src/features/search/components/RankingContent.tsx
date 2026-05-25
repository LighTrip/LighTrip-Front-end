import { getTotalRanking } from "@/src/api/searchApi";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import type { RankingUser } from "../types/ranking.types";
import RankingItem from "./RankingItem";
import TopRankingCard from "./TopRankingCard";

export default function RankingContent() {
    const [rankingList, setRankingList] = useState<RankingUser[]>([]);
    const [myRank, setMyRank] = useState<RankingUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchRanking = async () => {
        try {
            setIsLoading(true);
            setErrorMessage("");

            const result = await getTotalRanking();

            setRankingList(result.topRankings);
            setMyRank(result.myRank);
        }catch(error) {
            console.log("랭킹 조회 에러:", error);

            if(error instanceof Error) {
                setErrorMessage(error.message)
            } else{
                setErrorMessage("랭킹 조회 중 오류가 발생했습니다.");
            }
        }finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchRanking();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.centerBox}>
                <ActivityIndicator size="large" color="#1A3A6B" />
            </View>
        )
    }

    if (errorMessage) {
        return (
            <View style={styles.centerBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
        )
    }

    if(rankingList.length === 0) {
        return(
            <View style={styles.centerBox}>
                <Text style={styles.emptyText}>아직 랭킹 데이터가 없습니다.</Text>
            </View>
        )
    }

    const topThree = rankingList.slice(0, 3);

    return (
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.topRankingRow}>
                {topThree.map((user) => (
                    <TopRankingCard key={user.userId} user={user} />
                ))}
            </View>

            {myRank && (
                <View style={styles.myRankBox}>
                    <Text style={styles.myRankTitle}>내 랭킹</Text>
                    <RankingItem user={myRank} isMyRank />
                </View>
            )}

            <View style={styles.rankingList}>
                {rankingList.map((user) => (
                    <RankingItem key={user.userId} user={user} />
                ))}
            </View>
        </ScrollView>
    )
}

const styles =StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 2,
        paddingBottom: 120,
    },
    centerBox: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 14,
        color: "#ED3838",
        textAlign: "center",
    },
    emptyText: {
        fontSize: 14,
        color: "#666667",
        textAlign: "center",
    },
    topRankingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 18,
    },
    myRankBox: {
        marginBottom: 20,
    },
    myRankTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1A3A6B",
        marginBottom: 10,
    },
    rankingList: {
        gap: 12,
    }
})