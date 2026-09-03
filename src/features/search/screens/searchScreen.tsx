import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { Animated, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AllSearchContent from "../components/AllSearchContent";
import RankingContent from "../components/RankingContent";
import { subscribeSearchTabPress } from "../searchTabBus";
import { SearchTab } from "../types/search.types";

export type RankingMode = "total" | "district";

export default function SearchView() {
  const [selectedTab, setSelectedTab] = useState<SearchTab>("all");
  const [requestedFriendCodes, setRequestedFriendCodes] = useState<string[]>(
    [],
  );

  // total & district 선택
  const [rankingMode, setRankingMode] = useState<RankingMode>("total");
  const [isRankingDropdownOpen, setIsRankingDropdownOpen] = useState(false);

  const contentOpacity = useRef(new Animated.Value(1)).current;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    contentOpacity.setValue(0);

    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [selectedTab, contentOpacity]);

  // 둘러보기 탭을 다시 누르면 랭킹 탭/드롭다운을 접고 둘러보기 탭 메인으로 복귀
  useEffect(() => {
    return subscribeSearchTabPress(() => {
      setSelectedTab("all");
      setIsRankingDropdownOpen(false);
    });
  }, []);

  const rankingTitle = rankingMode === "total" ? "이번 주 랭킹" : "구별 랭킹";

  const handleSelectRankingMode = (mode: RankingMode) => {
    setRankingMode(mode);
    setIsRankingDropdownOpen(false);
  };

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.container}>
      <View style={styles.header}>
        <Animated.View style={[styles.titleArea, { opacity: contentOpacity }]}>
          <Text style={styles.title}>둘러보기</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.contentArea, { opacity: contentOpacity }]}>
        {selectedTab === "all" ? (
          <AllSearchContent
            requestedFriendCodes={requestedFriendCodes}
            setRequestedFriendCodes={setRequestedFriendCodes}
          />
        ) : (
          <RankingContent rankingMode={rankingMode} />
        )}

        {/* 카드가 화면 위아래 경계를 넘나들 때 그대로 잘려 보이는 걸 막는다. */}
        <LinearGradient
          colors={["#F8FAFD", "rgba(248, 250, 253, 0)"]}
          style={styles.contentTopFade}
          pointerEvents="none"
        />

        <LinearGradient
          colors={[
            "rgba(248, 250, 253, 0)",
            "rgba(248, 250, 253, 0.9)",
            "#F8FAFD",
          ]}
          locations={[0, 0.6, 1]}
          style={styles.contentBottomFade}
          pointerEvents="none"
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFD",
    overflow: "visible",
    paddingTop: StatusBar.currentHeight || 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 13,
    zIndex: 80,
    elevation: 100,
  },
  contentArea: {
    flex: 1,
  },
  contentTopFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  // 탭바가 콘텐츠 위에 떠 있어서, 탭바에 닿기 전에 카드가 사라지도록 넉넉히 잡는다.
  contentBottomFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  titleArea: {
    zIndex: 200,
    elevation: 200,
  },
  rankingTitleWrapper: {
    position: "relative",
    zIndex: 200,
    elevation: 200,
  },
  title: {
    fontWeight: "700",
    color: "#000000",
    fontSize: 24,
  },
  rankingTitleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dropdownBox: {
    position: "absolute",
    top: 34,
    left: 0,
    width: 130,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 300,
    zIndex: 300,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666667",
  },
  activeDropdownText: {
    color: "#1A3A6B",
    fontWeight: "700",
  },
});
