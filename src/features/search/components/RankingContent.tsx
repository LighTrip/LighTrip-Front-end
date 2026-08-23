import { getDistrictRanking, getTotalRanking } from "@/src/api/searchApi";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import type { RankingMode } from "../screens/searchScreen";
import type { RankingUser } from "../types/ranking.types";
import RankingItem from "./RankingItem";
import TopRankingCard from "./TopRankingCard";

type RankingContentProps = {
    rankingMode: RankingMode;
}

type District = {
    label: string;
    value: string;
};

const DISTRICT: District[] = [
    { label: "종로", value: "JONGNO" },
    { label: "중구", value: "JUNG" },
    { label: "용산", value: "YONGSAN" },
    { label: "성동", value: "SEONGDONG" },
    { label: "광진", value: "GWANGJIN" },
    { label: "동대문", value: "DONGDAEMUN" },
    { label: "중랑", value: "JUNGNANG" },
    { label: "성북", value: "SEONGBUK" },
    { label: "강북", value: "GANGBUK" },
    { label: "도봉", value: "DOBONG" },
    { label: "노원", value: "NOWON" },
    { label: "은평", value: "EUNPYEONG" },
    { label: "서대문", value: "SEODAEMUN" },
    { label: "마포", value: "MAPO" },
    { label: "양천", value: "YANGCHEON" },
    { label: "강서", value: "GANGSEO" },
    { label: "구로", value: "GURO" },
    { label: "금천", value: "GEUMCHEON" },
    { label: "영등포", value: "YEONGDEUNGPO" },
    { label: "동작", value: "DONGJAK" },
    { label: "관악", value: "GWANAK" },
    { label: "서초", value: "SEOCHO" },
    { label: "강남", value: "GANGNAM" },
    { label: "송파", value: "SONGPA" },
    { label: "강동", value: "GANGDONG" }, 
]

export default function RankingContent({rankingMode}: RankingContentProps) {
    const [rankingList, setRankingList] = useState<RankingUser[]>([]);
    const [myRank, setMyRank] = useState<RankingUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("JONGNO");

    const selectedDistrictLabel =
        DISTRICT.find((district) => district.value === selectedDistrict)?.label ?? "종로";

    //랭킹 화면 호출
    const fetchRanking = async () => {
        try {
            setIsLoading(true);
            setErrorMessage("");

            // 이번 주 랭킹 호출
            if (rankingMode === "total") {
                const result = await getTotalRanking();

                setRankingList(result.topRankings);
                setMyRank(result.myRank);
            // 구별 랭킹 호출
            }else {
                const result = await getDistrictRanking(selectedDistrict);

                setRankingList(result);
                setMyRank(null);
            }
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
    }, [rankingMode, selectedDistrict]);

    const topThree = rankingList.slice(0, 3);

    // 로딩·에러·빈 상태는 아래 본문에서 이미 처리한다.
    // 여기서 조기 반환하면 구 선택 칩까지 사라져 다른 구를 고를 수 없게 된다.
    return (
        <View style={styles.container}>
            {rankingMode === "district" && (
                <>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.districtScrollContent}
                    >
                        {DISTRICT.map((district) => (
                            <TouchableOpacity
                                key={district.value}
                                style={[
                                    styles.districtChip,
                                    selectedDistrict === district.value &&
                                        styles.activeDistrictChip,
                                ]}
                                onPress={() => setSelectedDistrict(district.value)}
                            >
                                <Text
                                    style={[
                                        styles.districtText,
                                        selectedDistrict === district.value &&
                                            styles.activeDistrictText,
                                    ]}
                                >
                                    {district.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={styles.districtTitle}>
                        {selectedDistrictLabel} 랭킹
                    </Text>
                </>
            )}

            {isLoading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color="#1A3A6B" />
                </View>
            ) : errorMessage ? (
                <View style={styles.centerBox}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
            ) : rankingList.length === 0 ? (
                <View style={styles.centerBox}>
                    <Text style={styles.emptyText}>
                        아직 랭킹 데이터가 없습니다.
                    </Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.topRankingRow}>
                        {topThree.map((user) => (
                            <TopRankingCard key={user.userId} user={user} />
                        ))}
                    </View>

                    {rankingMode === "total" && myRank && (
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
            )}
        </View>
    )
}

const styles =StyleSheet.create({
    container: {
        flex: 1,
    },
    districtScrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 10,
        gap: 8,
    },
    districtChip: {
        minWidth: 55,
        height: 34,
        paddingHorizontal: 14,
        borderRadius: 18,
        backgroundColor: "#E5EAF3",
        alignItems: "center",
        justifyContent: "center",
    },
    activeDistrictChip: {
        backgroundColor: "#1A3A6B",
    },
    districtText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#4B5563",
        textAlign: "center",
    },
    activeDistrictText: {
        color: "#FFFFFF",
    },
    districtTitle: {
        paddingHorizontal: 20,
        fontSize: 16,
        fontWeight: "700",
        color: "#1A3A6B",
    },
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
        alignItems: "center",
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
    },
})