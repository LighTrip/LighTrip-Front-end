import AddPlaceScreen from "@/src/features/place/screens/AddPlaceScreen";
import {
  NaverMapMarkerOverlay,
  NaverMapView,
} from "@mj-studio/react-native-naver-map";
import * as Location from "expo-location";
import { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NAVY = "#0F2744";
const TAB_BAR_HEIGHT = 70;

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

function UserLocationMarker() {
  return (
    <View style={styles.userLocationMarker}>
      <View style={styles.userLocationOuter}>
        <View style={styles.userLocationInner} />
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

interface PassportPin {
  latitude: number;
  longitude: number;
  placeName: string;
}

export default function MapScreen() {
  const { bottom: safeBottom } = useSafeAreaInsets();
  const [showDiscovery, setShowDiscovery] = useState(true);
  const [showRegisterBtn, setShowRegisterBtn] = useState(false);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [passportPins, setPassportPins] = useState<PassportPin[]>([]);
  const mapRef = useRef<any>(null);

  const baseBottom = TAB_BAR_HEIGHT + safeBottom + 12;

  const handleConfirm = () => {
    setPassportPins((prev) => [
      ...prev,
      {
        latitude: 37.5665,
        longitude: 126.978,
        placeName: "스타벅스 OO점",
      },
    ]);
    setShowDiscovery(false);
    setShowAddPlace(true);
  };

  const handleDismiss = () => {
    setShowDiscovery(false);
    setShowRegisterBtn(true);
  };

  const handleLocationPress = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("위치 권한이 필요합니다.");
      return;
    }
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    const { latitude, longitude } = location.coords;
    setUserLocation({ latitude, longitude });
    mapRef.current?.animateCameraTo({
      latitude,
      longitude,
      zoom: 16,
      duration: 500,
    });
  };

  if (showAddPlace) {
      return <AddPlaceScreen />
  }

  return (
    <View style={styles.container}>
      <NaverMapView
        ref={mapRef}
        style={styles.map}
        camera={{ latitude: 37.5665, longitude: 126.978, zoom: 14 }}
        isShowZoomControls={true}
      >
        {userLocation && (
          <NaverMapMarkerOverlay
            latitude={userLocation.latitude}
            longitude={userLocation.longitude}
            anchor={{ x: 0.5, y: 0.5 }}
            width={40}
            height={40}
          >
            <UserLocationMarker />
          </NaverMapMarkerOverlay>
        )}
        {passportPins.map((pin, index) => (
          <NaverMapMarkerOverlay
            key={index}
            latitude={pin.latitude}
            longitude={pin.longitude}
            anchor={{ x: 0.5, y: 1 }}
          />
        ))}
      </NaverMapView>

      {/* 탐험 진행도 — 하단 버튼 위에 위치 */}
      <View
        style={[styles.legendWrapper, { bottom: baseBottom + 64 }]}
        pointerEvents="none"
      >
        <ExplorationLegend />
      </View>

      {/* 현위치 버튼 + 나만의 장소 등록하기 한 줄 */}
      <View style={[styles.bottomBar, { bottom: baseBottom }]}>
        <TouchableOpacity
          style={styles.locationButton}
          activeOpacity={0.8}
          onPress={handleLocationPress}
        >
          <Text style={styles.locationButtonIcon}>◎</Text>
        </TouchableOpacity>

        {showRegisterBtn && (
          <TouchableOpacity
            style={styles.registerButton}
            activeOpacity={0.85}
            onPress={() => setShowAddPlace(true)}
          >
            <Text style={styles.registerButtonText}>나만의 장소 등록하기</Text>
          </TouchableOpacity>
        )}
      </View>

      {showDiscovery && (
        <View style={[styles.discoveryWrapper, { bottom: baseBottom + 60 }]}>
          <DiscoveryCard
            placeName="스타벅스 OO점"
            district="서울시 영등포구"
            onConfirm={handleConfirm}
            onDismiss={handleDismiss}
          />
        </View>
      )}

      {showAddPlace && (
        <View style={StyleSheet.absoluteFill}>
          <AddPlaceScreen />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  userLocationMarker: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  userLocationOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(66, 133, 244, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(66, 133, 244, 0.4)",
  },
  userLocationInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4285F4",
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#4285F4",
    shadowOpacity: 0.5,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },

  // 탐험 진행도 — 오른쪽, 버튼보다 위
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

  // 현위치 + 등록 버튼 한 줄
  bottomBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  locationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  locationButtonIcon: { fontSize: 22, color: "#334155" },

  registerButton: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  registerButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },

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
