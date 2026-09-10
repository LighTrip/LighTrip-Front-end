import {
    getMyScraps,
    ScrapPassport,
    scrapPassport,
    unscrapPassport,
} from "@/src/api/list/scrap.api";
import { getPassportDetail } from "@/src/api/passport/passport.api";
import { getPublicUserProfile } from "@/src/api/socialApi";
import PassportCardView from "@/src/components/common/PassportCardView";
import type { PublicUserProfile } from "@/src/features/social/types/social.types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    FlatList,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScrapPassportCard from "../components/ScrapPassportCard";

const PAGE_SIZE = 10;

export default function ScrapScreen() {
  const router = useRouter();

  // 스크랩한 여권 전체 목록 관련 상태
  const [scraps, setScraps] = useState<ScrapPassport[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [hasNext, setHasNext] = useState(true);

  // 목록에 있는 항목은 기본적으로 스크랩된 상태다.
  // 이 화면에서 취소한 항목만 따로 기억해 두고, 다시 누르면 되돌릴 수 있게 한다.
  const [unscrappedIds, setUnscrappedIds] = useState<number[]>([]);
  const [scrappingIds, setScrappingIds] = useState<number[]>([]);

  // 스크랩한 여권 중 하나 열람
  const [selectedPassport, setSelectedPassport] = useState<any | null>(null);
  // 여권 상세 응답에는 작성자 닉네임/프로필이 없어서 따로 받아 둔다.
  const [selectedWriter, setSelectedWriter] =
    useState<PublicUserProfile | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const handleCloseDetail = () => {
    setSelectedPassport(null);
    setSelectedWriter(null);
  };

  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // 여권을 펼쳐 둔 상태에서는 X 버튼과 같이 목록으로만 돌아간다.
        if (selectedPassport) {
          handleCloseDetail();
          return true;
        }

        router.replace("/profile" as any);
        return true;
      },
    );

    return () => subscription.remove();
  }, [router, selectedPassport]);

  // 스크랩 목록 검색
  const filteredScraps = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) {
      return scraps;
    }

    return scraps.filter((item) => {
      return (
        item.spaceName.toLowerCase().includes(keyword) ||
        item.address.toLowerCase().includes(keyword) ||
        item.content.toLowerCase().includes(keyword)
      );
    });
  }, [scraps, searchText]);

  // 스크랩 목록 조회 호출
  const fetchScraps = async ({
    isInitial = false,
    isRefresh = false,
  }: {
    isInitial?: boolean;
    isRefresh?: boolean;
  }) => {
    try {
      if (isInitial) {
        setIsLoading(true);
      }

      if (isRefresh) {
        setIsRefreshing(true);
      }

      const response = await getMyScraps({
        size: PAGE_SIZE,
      });

      console.log("내 스크랩 목록 조회 응답:", response.data);

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "스크랩 목록 조회 실패");
      }

      setScraps(result.data.content);
      setCursor(result.data.nextCursor);
      setHasNext(result.data.hasNext);
      // 새로 받은 목록은 전부 스크랩된 상태이므로 취소 표시를 비운다.
      setUnscrappedIds([]);
    } catch (error) {
      console.log("스크랩 목록 조회 에러:", error);

      Alert.alert(
        "스크랩 목록 조회 실패",
        error instanceof Error
          ? error.message
          : "스크랩 목록을 불러오는 중 문제가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // 스크랩 목록 조회 추가 호출
  const fetchMoreScraps = async () => {
    if (
      !hasNext ||
      isFetchingMore ||
      cursor === undefined ||
      cursor === null ||
      searchText.trim()
    ) {
      return;
    }

    try {
      setIsFetchingMore(true);

      const response = await getMyScraps({
        cursor,
        size: PAGE_SIZE,
      });

      console.log("내 스크랩 다음 목록 조회 응답:", response.data);

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "스크랩 다음 목록 조회 실패");
      }

      setScraps((prev) => [...prev, ...result.data.content]);
      setCursor(result.data.nextCursor);
      setHasNext(result.data.hasNext);
    } catch (error) {
      console.log("스크랩 다음 목록 조회 에러:", error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchScraps({ isInitial: true });
  }, []);

  // 스크랩 아이콘을 눌러 취소/재등록
  const handleToggleScrap = async (passportId: number) => {
    if (scrappingIds.includes(passportId)) return;

    const wasScrapped = !unscrappedIds.includes(passportId);

    const applyScrapState = (scrapped: boolean) => {
      setUnscrappedIds((prev) =>
        scrapped
          ? prev.filter((id) => id !== passportId)
          : [...prev, passportId],
      );
      setScraps((prev) =>
        prev.map((item) =>
          item.passportId === passportId
            ? {
                ...item,
                scrapCount: scrapped
                  ? item.scrapCount + 1
                  : Math.max(item.scrapCount - 1, 0),
              }
            : item,
        ),
      );
    };

    try {
      setScrappingIds((prev) => [...prev, passportId]);

      // 화면에 먼저 반영
      applyScrapState(!wasScrapped);

      if (wasScrapped) {
        await unscrapPassport(passportId);
      } else {
        await scrapPassport(passportId);
      }
    } catch (error) {
      console.log("스크랩 처리 에러:", error);

      // 실패하면 원래 상태로 복구
      applyScrapState(wasScrapped);

      Alert.alert(
        wasScrapped ? "스크랩 취소 실패" : "스크랩 실패",
        error instanceof Error
          ? error.message
          : "스크랩을 처리하는 중 문제가 발생했습니다.",
      );
    } finally {
      setScrappingIds((prev) => prev.filter((id) => id !== passportId));
    }
  };

  // 스크랩한 목록 중 여권 하나 호출
  const handlePressCard = async (passportId: number) => {
    try {
      setIsDetailLoading(true);

      console.log("선택한 passportId:", passportId);

      const response = await getPassportDetail(passportId);

      console.log("여권 상세 조회 응답:", response.data);

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "여권 상세 조회 실패");
      }

      const detail = result.data;

      // 작성자 조회가 실패하더라도 여권 자체는 볼 수 있어야 한다.
      let writer: PublicUserProfile | null = null;

      try {
        writer = await getPublicUserProfile(detail.userId);
      } catch (writerError) {
        console.log("여권 작성자 프로필 조회 에러:", writerError);
      }

      setSelectedWriter(writer);
      setSelectedPassport(detail);
    } catch (error) {
      console.log("여권 상세 조회 에러:", error);

      Alert.alert(
        "여권 상세 조회 실패",
        error instanceof Error
          ? error.message
          : "여권 상세를 불러오는 중 문제가 발생했습니다.",
      );
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleSearchSubmit = () => {
    Keyboard.dismiss();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A3A6B" />
      </View>
    );
  }

  if (isDetailLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A3A6B" />
      </View>
    );
  }

  if (selectedPassport) {
    return (
      <PassportCardView
        passport={selectedPassport}
        writer={selectedWriter}
        onClose={handleCloseDetail}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* 목록과 함께 스크롤돼 사라지지 않도록 헤더·검색창은 FlatList 밖에 고정한다. */}
      <View style={styles.headerArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => router.replace("/profile" as any)}
          >
            <Ionicons name="chevron-back" size={28} color="#111827" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>스크랩한 여권</Text>

          <View style={styles.headerRightBlank} />
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchInputBox}>
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="찾고 싶은 여권을 검색해 보세요!"
              placeholderTextColor="#D6DEEA"
              style={styles.searchInput}
              returnKeyType="search"
              onSubmitEditing={handleSearchSubmit}
            />

            {searchText.length > 0 && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSearchText("")}
              >
                <Ionicons name="close-circle" size={20} color="#D6DEEA" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.searchButton}
            activeOpacity={0.8}
            onPress={handleSearchSubmit}
          >
            <Ionicons name="search" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.resultText}>
          {searchText.trim()
            ? `검색 결과 ${filteredScraps.length}개`
            : `내가 저장한 여권 ${scraps.length}개`}
        </Text>
      </View>

      <View style={styles.listArea}>
        <FlatList
          data={filteredScraps}
          keyExtractor={(item) => String(item.scrapId)}
          renderItem={({ item }) => (
            <ScrapPassportCard
              item={item}
              isScrapped={!unscrappedIds.includes(item.passportId)}
              isScrapping={scrappingIds.includes(item.passportId)}
              onPress={handlePressCard}
              onToggleScrap={handleToggleScrap}
            />
          )}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onEndReached={fetchMoreScraps}
          onEndReachedThreshold={0.4}
          refreshing={isRefreshing}
          onRefresh={() => fetchScraps({ isRefresh: true })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="bookmark-outline" size={52} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>스크랩한 여권이 없어요</Text>
              <Text style={styles.emptyDescription}>
                마음에 드는 여권을 스크랩하면 여기에 모아볼 수 있어요.
              </Text>
            </View>
          }
          ListFooterComponent={
            isFetchingMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color="#1A3A6B" />
                <Text style={styles.footerText}>더 불러오는 중...</Text>
              </View>
            ) : (
              <View style={styles.footerSpace} />
            )
          }
        />

        {/* 고정 헤더와 맞닿는 지점. 카드가 딱 잘리지 않게만 살짝 덮는다. */}
        <LinearGradient
          colors={[
            "#F8FAFD",
            "rgba(248, 250, 253, 0.5)",
            "rgba(248, 250, 253, 0)",
          ]}
          locations={[0, 0.55, 1]}
          style={styles.listTopFade}
          pointerEvents="none"
        />

        {/* 탭바가 콘텐츠 위에 떠 있어서, 카드가 탭바에 닿기 전에 사라지게 한다.
                    탭바가 덮는 높이만 가리고, 그 위는 최대한 또렷하게 남긴다. */}
        <LinearGradient
          colors={[
            "rgba(248, 250, 253, 0)",
            "rgba(248, 250, 253, 0.55)",
            "rgba(248, 250, 253, 0.92)",
            "#F8FAFD",
          ]}
          locations={[0, 0.5, 0.78, 1]}
          style={styles.listBottomFade}
          pointerEvents="none"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFD",
  },
  headerArea: {
    paddingHorizontal: 18,
    paddingTop: 10,
    backgroundColor: "#F8FAFD",
  },
  listArea: {
    flex: 1,
    position: "relative",
  },
  content: {
    paddingHorizontal: 18,
    // 첫 카드가 헤더에 붙지 않도록 띄운다. 이 여백 덕에 가만히 있을 때는
    // 상단 페이드가 카드에 거의 닿지 않고, 스크롤할 때만 걸린다.
    paddingTop: 14,
    // 마지막 카드가 탭바와 페이드 위로 완전히 올라올 만큼 비워 둔다.
    paddingBottom: 130,
  },
  // 카드가 elevation: 5를 갖고 있다. Android는 elevation 순으로 그리므로
  // 페이드에 그보다 높은 값을 주지 않으면 카드 밑에 깔려 보이지 않는다.
  listTopFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    elevation: 10,
    zIndex: 10,
  },
  listBottomFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    // 떠 있는 탭바가 차지하는 높이(바 58 + 아래 여백)만큼만 잡는다.
    height: 96,
    elevation: 10,
    zIndex: 10,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F8FAFD",
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "600",
  },
  headerRightBlank: {
    width: 36,
    height: 36,
  },

  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  searchInputBox: {
    flex: 1,
    height: 46,
    backgroundColor: "#1A3A6B",
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 0,
  },
  searchButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#1A3A6B",
    justifyContent: "center",
    alignItems: "center",
  },
  resultText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 14,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    // 헤더가 목록 밖으로 나가면서 그만큼 위 여백을 줄인다.
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 14,
    marginBottom: 8,
  },
  emptyDescription: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  footerLoading: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    color: "#6B7280",
    fontSize: 13,
    marginLeft: 8,
  },
  footerSpace: {
    height: 20,
  },
});
