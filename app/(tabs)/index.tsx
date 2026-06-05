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

/** 지도 중앙에 고정되는 핀 */
function CenterPin() {
  return (
    <View style={styles.centerPinWrapper} pointerEvents="none">
      <Text style={styles.centerPinEmoji}>📍</Text>
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

/** 위치 확인 카드 — 핀 고정 후 "이 위치가 맞습니까?" */
interface LocationConfirmCardProps {
  onConfirm: () => void;
  onCancel: () => void;
}

function LocationConfirmCard({
  onConfirm,
  onCancel,
}: LocationConfirmCardProps) {
  return (
    <View style={styles.discoveryCard}>
      <View style={styles.placeNameBar}>
        <Text style={styles.placeNameText}>위치 확인</Text>
      </View>
      <View style={styles.discoveryBody}>
        <Text style={styles.discoveryTitle}>이 위치가 맞습니까?</Text>
        <Text style={styles.locationText}>
          핀이 가리키는 위치에 장소를 등록합니다.
        </Text>
        <View style={[styles.discoveryActions, { marginTop: 10 }]}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={onConfirm}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmButtonText}>예</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onCancel}
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

// 지도 중앙 좌표를 가져오기 위한 카메라 상태 타입
interface CameraState {
  latitude: number;
  longitude: number;
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

  // 장소 직접 선택 모드
  const [pickingLocation, setPickingLocation] = useState(false);
  // 핀 위치 확인 카드 표시
  const [showLocationConfirm, setShowLocationConfirm] = useState(false);
  // 현재 카메라(지도 중앙) 좌표
  const [cameraCenter, setCameraCenter] = useState<CameraState>({
    latitude: 37.5665,
    longitude: 126.978,
  });

  const mapRef = useRef<any>(null);

  const baseBottom = TAB_BAR_HEIGHT + safeBottom + 12;

  // Discovery card: "나만의 여권 만들기"
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

  // Discovery card: "아니요"
  const handleDismiss = () => {
    setShowDiscovery(false);
    setShowRegisterBtn(true);
  };

  // "나만의 장소 등록하기" 버튼 → 위치 선택 모드 진입
  const handleRegisterPress = () => {
    setShowRegisterBtn(false);
    setPickingLocation(true);
  };

  // 지도 카메라 이동 이벤트 → 중앙 좌표 갱신
  const handleCameraChanged = (event: any) => {
    const { latitude, longitude } = event;
    if (latitude && longitude) {
      setCameraCenter({ latitude, longitude });
    }
  };

  // 위치 선택 모드에서 "위치 고정" 버튼
  const handlePinLocation = () => {
    setShowLocationConfirm(true);
  };

  // 위치 확인 카드: "예" → AddPlace로
  const handleLocationConfirm = () => {
    setPickingLocation(false);
    setShowLocationConfirm(false);
    setShowAddPlace(true);
  };

  // 위치 확인 카드: "아니요" → 다시 조정
  const handleLocationCancel = () => {
    setShowLocationConfirm(false);
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
        isShowZoomControls={!pickingLocation}
        onCameraChanged={handleCameraChanged}
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

      {/* 위치 선택 모드: 화면 중앙 고정 핀 */}
      {pickingLocation && <CenterPin />}

      {/* 탐험 진행도 */}
      {!pickingLocation && (
        <View
          style={[styles.legendWrapper, { bottom: baseBottom + 64 }]}
          pointerEvents="none"
        >
          <ExplorationLegend />
        </View>
      )}

      {/* 하단 바: 현위치 버튼 + 장소 등록 버튼 */}
      {!pickingLocation && (
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
              onPress={handleRegisterPress}
            >
              <Text style={styles.registerButtonText}>
                나만의 장소 등록하기
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* 위치 선택 모드 안내 + 위치 고정 버튼 */}
      {pickingLocation && !showLocationConfirm && (
        <>
          {/* 상단 안내 */}
          <View style={styles.pickingGuideWrapper}>
            <View style={styles.pickingGuideCard}>
              <Text style={styles.pickingGuideText}>
                지도를 움직여 핀을 원하는 위치에 맞추세요
              </Text>
            </View>
          </View>

          {/* 하단: 현위치 버튼 + 위치 고정 버튼 */}
          <View style={[styles.bottomBar, { bottom: baseBottom }]}>
            <TouchableOpacity
              style={styles.locationButton}
              activeOpacity={0.8}
              onPress={handleLocationPress}
            >
              <Text style={styles.locationButtonIcon}>◎</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.registerButton}
              activeOpacity={0.85}
              onPress={handlePinLocation}
            >
              <Text style={styles.registerButtonText}>이 위치로 고정</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* 위치 확인 카드 */}
      {pickingLocation && showLocationConfirm && (
        <View style={[styles.discoveryWrapper, { bottom: baseBottom + 60 }]}>
          <LocationConfirmCard
            onConfirm={handleLocationConfirm}
            onCancel={handleLocationCancel}
          />
        </View>
      )}

      {/* Discovery 카드 */}
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

      {/* AddPlaceScreen */}
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

  // 화면 중앙 고정 핀
  centerPinWrapper: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -16,
    marginTop: -40,
    zIndex: 10,
  },
  centerPinEmoji: {
    fontSize: 36,
  },

  // 위치 선택 모드 상단 안내
  pickingGuideWrapper: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    alignItems: "center",
    zIndex: 10,
  },
  pickingGuideCard: {
    backgroundColor: "rgba(15, 39, 68, 0.85)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  pickingGuideText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

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
