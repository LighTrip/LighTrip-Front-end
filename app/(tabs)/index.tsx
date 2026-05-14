import {
  NaverMapMarkerOverlay,
  NaverMapView,
} from "@mj-studio/react-native-naver-map";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NAVY = "#0F2744";
const TAB_BAR_HEIGHT = 80; // 탭바 컴포넌트 실제 높이로 조정

function ExplorationLegend() {
  return (
    <View style={styles.legendCard}>
      <Text style={styles.legendTitle}>탐험 진행도</Text>
      <View style={styles.legendRow}>
        <View style={[styles.legendDot, { backgroundColor: "#CBD5E1" }]} />
        <Text style={styles.legendLabel}>미탐험 구역</Text>
      </View>
      <View style={styles.legendRow}>
        <View style={[styles.legendDot, { backgroundColor: "#818CF8" }]} />
        <Text style={styles.legendLabel}>발견된 가게</Text>
      </View>
      <View style={styles.legendRow}>
        <View style={[styles.legendDot, { backgroundColor: "#1E3A5F" }]} />
        <Text style={styles.legendLabel}>탐험 완료</Text>
      </View>
    </View>
  );
}

interface DiscoveryCardProps {
  placeName: string;
  district: string;
  onConfirm: () => void;
  onDismiss: () => void;
}

function DiscoveryCard({
  placeName,
  district,
  onConfirm,
  onDismiss,
}: DiscoveryCardProps) {
  return (
    <View style={styles.discoveryCard}>
      <View style={styles.placeNameBar}>
        <Text style={styles.placeNameText}>{placeName}</Text>
      </View>
      <View style={styles.discoveryBody}>
        <Text style={styles.discoveryTitle}>새로운 장소를 발견하셨군요!</Text>
        <View style={styles.discoveryLocation}>
          <Text style={styles.locationPin}>📍</Text>
          <Text style={styles.locationText}>{district}</Text>
        </View>
        <View style={styles.discoveryActions}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={onConfirm}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmButtonText}>나만의 여권 만들기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
            activeOpacity={0.85}
          >
            <Text style={styles.dismissButtonText}>아니요</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function MapScreen() {
  const { bottom: safeBottom } = useSafeAreaInsets();
  const [showDiscovery, setShowDiscovery] = useState(true);
  const [showRegisterBtn, setShowRegisterBtn] = useState(false);

  // 탭바 위 기준점
  const baseBottom = TAB_BAR_HEIGHT + safeBottom + 12;

  const handleConfirm = () => {
    setShowDiscovery(false);
  };

  const handleDismiss = () => {
    setShowDiscovery(false);
    setShowRegisterBtn(true);
  };

  return (
    <View style={styles.container}>
      <NaverMapView
        style={styles.map}
        camera={{ latitude: 37.5665, longitude: 126.978, zoom: 14 }}
      >
        <NaverMapMarkerOverlay
          latitude={37.5665}
          longitude={126.978}
          anchor={{ x: 0.5, y: 1 }}
        />
      </NaverMapView>

      {/* 탐험 범례 */}
      <View
        style={[styles.legendWrapper, { bottom: baseBottom }]}
        pointerEvents="none"
      >
        <ExplorationLegend />
      </View>

      {/* 현재 위치 버튼 */}
      <TouchableOpacity
        style={[styles.locationButton, { bottom: baseBottom }]}
        activeOpacity={0.8}
      >
        <Text style={styles.locationButtonIcon}>◎</Text>
      </TouchableOpacity>

      {/* 나만의 장소 등록하기 버튼 */}
      {showRegisterBtn && (
        <View style={[styles.registerButtonWrapper, { bottom: baseBottom }]}>
          <TouchableOpacity
            style={styles.registerButton}
            activeOpacity={0.85}
            onPress={() => setShowRegisterBtn(false)}
          >
            <Text style={styles.registerButtonText}>나만의 장소 등록하기</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 장소 발견 팝업 */}
      {showDiscovery && (
        <View style={[styles.discoveryWrapper, { bottom: baseBottom - 4 }]}>
          <DiscoveryCard
            placeName="스타벅스 OO점"
            district="서울시 영등포구"
            onConfirm={handleConfirm}
            onDismiss={handleDismiss}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  legendWrapper: {
    position: "absolute",
    right: 16,
  },
  legendCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 5,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 3 },
  legendLabel: { fontSize: 11, color: "#475569" },

  locationButton: {
    position: "absolute",
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  locationButtonIcon: { fontSize: 20, color: "#334155" },

  registerButtonWrapper: {
    position: "absolute",
    left: 70,
    right: 70,
    alignItems: "center",
  },
  registerButton: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  registerButtonText: { fontSize: 14, fontWeight: "600", color: "#1E293B" },

  discoveryWrapper: {
    position: "absolute",
    left: 16,
    right: 16,
  },
  discoveryCard: {
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  placeNameBar: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    alignItems: "center",
  },
  placeNameText: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  discoveryBody: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 6,
  },
  discoveryTitle: { fontSize: 17, fontWeight: "700", color: "#1E293B" },
  discoveryLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 14,
  },
  locationPin: { fontSize: 13 },
  locationText: { fontSize: 13, color: "#64748B" },
  discoveryActions: { flexDirection: "row", gap: 10, width: "100%" },
  confirmButton: {
    flex: 1,
    backgroundColor: NAVY,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonText: { color: "white", fontWeight: "700", fontSize: 15 },
  dismissButton: {
    flex: 0.5,
    backgroundColor: "#F1F5F9",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  dismissButtonText: { color: "#475569", fontWeight: "600", fontSize: 15 },
});
