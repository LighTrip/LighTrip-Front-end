import { getMyLights, LightItem } from "@/src/api/lights.api";
import { getPassportDetail } from "@/src/api/passport/passport.api";
import PassportDetail from "@/src/features/passport/screens/PassportDetail";
import AddPlaceScreen from "@/src/features/place/screens/AddPlaceScreen";
import {
  NaverMapMarkerOverlay,
  NaverMapView
} from "@mj-studio/react-native-naver-map";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NAVY = "#0F2744";
const GREEN = "#34D399";
const GREEN_DARK = "#065F46";
const GREEN_MID = "#059669";
const TAB_BAR_HEIGHT = 70;
const NCP_CLIENT_ID = process.env.EXPO_PUBLIC_NCP_CLIENT_ID ?? "";
const NCP_CLIENT_SECRET = process.env.EXPO_PUBLIC_NCP_CLIENT_SECRET ?? "";

// ─── 타입 ────────────────────────────────────────────────────────────────

interface PassportPreview {
  passportId: number;
  spaceName: string;
  address: string;
  visitedAt: string;
  imageUrl: string | null;
  musicTitle: string | null;
  musicArtist: string | null;
}

interface BBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

interface PickedLocation {
  latitude: number;
  longitude: number;
  address: string | null;
}

// 프론트 클러스터
interface FrontCluster {
  id: string;
  centerLat: number;
  centerLng: number;
  items: LightItem[];
}

// ─── 상수 ────────────────────────────────────────────────────────────────

const INITIAL_BBOX: BBox = {
  minLat: 37.41,
  maxLat: 37.72,
  minLng: 126.77,
  maxLng: 127.18,
};

// ─── 유틸 함수 ────────────────────────────────────────────────────────────

function cameraToBBox(event: any): BBox | null {
  const region = event?.region;
  if (
    region &&
    typeof region.latitude === "number" &&
    typeof region.longitude === "number" &&
    typeof region.latitudeDelta === "number" &&
    typeof region.longitudeDelta === "number"
  ) {
    return {
      minLat: region.latitude,
      maxLat: region.latitude + region.latitudeDelta,
      minLng: region.longitude,
      maxLng: region.longitude + region.longitudeDelta,
    };
  }
  const lat = event?.latitude;
  const lng = event?.longitude;
  if (!lat || !lng) return null;
  const delta = 0.05;
  return {
    minLat: lat - delta,
    maxLat: lat + delta,
    minLng: lng - delta,
    maxLng: lng + delta,
  };
}

function clusterRadiusFromBBox(bbox: BBox | null): number {
  if (!bbox) return 0.01;
  const latSpan = bbox.maxLat - bbox.minLat;
  const lngSpan = bbox.maxLng - bbox.minLng;
  const diagonal = Math.sqrt(latSpan * latSpan + lngSpan * lngSpan);
  return Math.max(0.000003, diagonal * 0.08);
}

function clusterSingleMarkers(
  items: LightItem[],
  bbox: BBox | null,
): FrontCluster[] {
  const radius = clusterRadiusFromBBox(bbox);
  const singles = items.filter((it) => !it.isCluster);
  const assigned = new Array(singles.length).fill(false);
  const clusters: FrontCluster[] = [];

  singles.forEach((item, i) => {
    if (assigned[i]) return;
    const group: LightItem[] = [item];
    assigned[i] = true;

    singles.forEach((other, j) => {
      if (assigned[j]) return;
      const dlat = item.latitude - other.latitude;
      const dlng = item.longitude - other.longitude;
      if (Math.sqrt(dlat * dlat + dlng * dlng) <= radius) {
        group.push(other);
        assigned[j] = true;
      }
    });

    const centerLat =
      group.reduce((s, it) => s + it.latitude, 0) / group.length;
    const centerLng =
      group.reduce((s, it) => s + it.longitude, 0) / group.length;

    clusters.push({
      id: `fc-${i}`,
      centerLat,
      centerLng,
      items: group,
    });
  });

  return clusters;
}

async function naverReverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${longitude},${latitude}&orders=roadaddr,addr&output=json`,
      {
        headers: {
          "x-ncp-apigw-api-key-id": NCP_CLIENT_ID,
          "x-ncp-apigw-api-key": NCP_CLIENT_SECRET,
        },
      },
    );
    const json = await res.json();
    const results = json.results;
    if (!Array.isArray(results) || results.length === 0) return null;

    const roadaddr = results.find((r: any) => r.name === "roadaddr");
    const addr = results.find((r: any) => r.name === "addr");
    const target = roadaddr ?? addr;
    if (!target) return null;

    const r = target.region;
    const area1 = r.area1?.name ?? "";
    const area2 = r.area2?.name ?? "";
    const area3 = r.area3?.name ?? "";
    const land = target.land;

    if (roadaddr && land?.name) {
      const building = land.addition0?.value ? ` ${land.addition0.value}` : "";
      return `${area1} ${area2} ${land.name} ${land.number1}${building}`.trim();
    }
    if (addr && land?.number1) {
      const number2 = land.number2 ? `-${land.number2}` : "";
      return `${area1} ${area2} ${area3} ${land.number1}${number2}`.trim();
    }
    return `${area1} ${area2} ${area3}`.trim() || null;
  } catch (e) {
    console.error("네이버 역지오코딩 실패:", e);
    return null;
  }
}

// ─── 서브 컴포넌트 ────────────────────────────────────────────────────────

function ExplorationLegend() {
  return (
    <View style={styles.legendCard}>
      <Text style={styles.legendTitle}>여행 진행도</Text>
      <View style={styles.legendRow}>
        <View style={[styles.legendDot, { backgroundColor: "#D1FAE5" }]} />
        <Text style={styles.legendLabel}>미탐험 구역</Text>
      </View>
      <View style={styles.legendRow}>
        <View style={[styles.legendDot, { backgroundColor: GREEN }]} />
        <Text style={styles.legendLabel}>발견된 가게</Text>
      </View>
      <View style={styles.legendRow}>
        <View style={[styles.legendDot, { backgroundColor: GREEN_DARK }]} />
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

function PassportMarker({ spaceName }: { spaceName: string }) {
  return (
    <View style={styles.passportMarkerWrapper}>
      <View style={styles.passportMarkerBubble}>
        <View style={styles.passportMarkerIconCircle}>
          <Text style={styles.passportMarkerEmoji}>🛂</Text>
        </View>
        <Text style={styles.passportMarkerLabel} numberOfLines={1}>
          {spaceName}
        </Text>
      </View>
      <View style={styles.passportMarkerTail} />
    </View>
  );
}

/** 서버 클러스터 마커 */
function ServerClusterMarker({ count }: { count: number }) {
  return (
    <View style={styles.clusterWrapper}>
      <View style={styles.clusterBubble}>
        <Text style={styles.clusterCount}>{count}</Text>
      </View>
      <View style={styles.clusterTail} />
    </View>
  );
}

/** 프론트 클러스터 마커 */
function FrontClusterMarker({ count }: { count: number }) {
  return (
    <View style={styles.frontClusterWrapper}>
      <View style={styles.frontClusterOuter}>
        <View style={styles.frontClusterInner}>
          <Text style={styles.frontClusterCount}>{count}</Text>
        </View>
      </View>
      <View style={styles.frontClusterTail} />
    </View>
  );
}

function CenterPin() {
  return (
    <View style={styles.centerPinWrapper} pointerEvents="none">
      <Text style={styles.centerPinEmoji}>📍</Text>
    </View>
  );
}

// ─── 바텀시트 ─────────────────────────────────────────────────────────────

interface ClusterBottomSheetProps {
  cluster: FrontCluster | null;
  onClose: () => void;
  onSelectItem: (item: LightItem) => void;
}

function ClusterBottomSheet({
  cluster,
  onClose,
  onSelectItem,
}: ClusterBottomSheetProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (cluster) {
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [cluster]);

  if (!cluster) return null;

  return (
    <Modal
      visible={!!cluster}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.sheetBackdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View
        style={[
          styles.sheetContainer,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [400, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.sheetHandle} />

        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>
            이 근처 장소 {cluster.items.length}곳
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={styles.sheetCloseText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={styles.sheetScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {cluster.items.map((item, idx) => (
            <TouchableOpacity
              key={`sheet-item-${item.passportId ?? idx}`}
              style={styles.sheetItem}
              activeOpacity={0.75}
              onPress={() => onSelectItem(item)}
            >
              <View style={styles.sheetItemIcon}>
                <Text style={styles.sheetItemEmoji}>🛂</Text>
              </View>
              <View style={styles.sheetItemBody}>
                <Text style={styles.sheetItemName} numberOfLines={1}>
                  {item.spaceName}
                </Text>
              </View>
              <Text style={styles.sheetItemChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ─── PassportPreviewCard ─────────────────────────────────────────────────

interface PassportPreviewCardProps {
  preview: PassportPreview | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onOpenDetail: () => void;
}

function PassportPreviewCard({
  preview,
  loading,
  error,
  onClose,
  onOpenDetail,
}: PassportPreviewCardProps) {
  return (
    <View style={styles.previewCard}>
      <TouchableOpacity
        style={styles.previewCloseBtn}
        onPress={onClose}
        hitSlop={12}
      >
        <Text style={styles.previewCloseText}>✕</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.previewCenter}>
          <ActivityIndicator color={GREEN_MID} />
          <Text style={styles.previewLoadingText}>불러오는 중...</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.previewCenter}>
          <Text style={styles.previewErrorText}>⚠️ {error}</Text>
        </View>
      )}

      {preview && !loading && (
        <>
          {preview.imageUrl ? (
            <Image
              source={{ uri: preview.imageUrl }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.previewImagePlaceholder}>
              <Text style={styles.previewImagePlaceholderText}>🖼️</Text>
            </View>
          )}
          <View style={styles.previewBody}>
            <Text style={styles.previewPlaceName} numberOfLines={1}>
              {preview.spaceName}
            </Text>
            <View style={styles.previewRow}>
              <Text style={styles.previewRowIcon}>📍</Text>
              <Text style={styles.previewRowText} numberOfLines={1}>
                {preview.address}
              </Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewRowIcon}>🗓</Text>
              <Text style={styles.previewRowText}>{preview.visitedAt}</Text>
            </View>
            {preview.musicTitle && (
              <View style={styles.previewRow}>
                <Text style={styles.previewRowIcon}>🎵</Text>
                <Text style={styles.previewRowText} numberOfLines={1}>
                  {preview.musicTitle}
                  {preview.musicArtist ? ` — ${preview.musicArtist}` : ""}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.previewDetailBtn}
              activeOpacity={0.85}
              onPress={onOpenDetail}
            >
              <Text style={styles.previewDetailBtnText}>여권 상세보기</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

// ─── LocationConfirmCard ──────────────────────────────────────────────────

interface LocationConfirmCardProps {
  latitude: number;
  longitude: number;
  address: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function LocationConfirmCard({
  latitude,
  longitude,
  address,
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
          {address ?? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`}
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

// ─── 메인 스크린 ──────────────────────────────────────────────────────────

export default function MapScreen() {
  const { bottom: safeBottom } = useSafeAreaInsets();

  const [showRegisterBtn, setShowRegisterBtn] = useState(true);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [lights, setLights] = useState<LightItem[]>([]);
  const [currentBBox, setCurrentBBox] = useState<BBox | null>(INITIAL_BBOX);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState<PassportPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [detailItem, setDetailItem] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [pickingLocation, setPickingLocation] = useState(false);
  const [showLocationConfirm, setShowLocationConfirm] = useState(false);
  const [cameraCenter, setCameraCenter] = useState({
    latitude: 37.5665,
    longitude: 126.978,
  });
  const [pickedLocation, setPickedLocation] = useState<PickedLocation | null>(
    null,
  );
  const [addressLoading, setAddressLoading] = useState(false);

  const [activeCluster, setActiveCluster] = useState<FrontCluster | null>(null);

  const mapRef = useRef<any>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baseBottom = TAB_BAR_HEIGHT + safeBottom + 12;

  const frontClusters = clusterSingleMarkers(lights, currentBBox);

  const loadLights = useCallback(async (bbox: BBox) => {
    try {
      const res = await getMyLights(bbox);
      const data = res.data.data;
      const items: LightItem[] = Array.isArray(data) ? data : [];

      console.log(
        `[Lights] BBox: minLat=${bbox.minLat.toFixed(4)}, maxLat=${bbox.maxLat.toFixed(4)}, minLng=${bbox.minLng.toFixed(4)}, maxLng=${bbox.maxLng.toFixed(4)}`,
      );
      console.log(`[Lights] 총 ${items.length}개 마커`);

      setLights(items);
    } catch (e: any) {
      console.error("lights fetch 실패:", e.message);
      setLights([]);
    }
  }, []);

  useEffect(() => {
    loadLights(INITIAL_BBOX);
  }, []);

  const handleCameraChanged = useCallback(
    (event: any) => {
      const lat = event?.latitude;
      const lng = event?.longitude;
      if (lat && lng) setCameraCenter({ latitude: lat, longitude: lng });

      if (pickingLocation) return;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        const bbox = cameraToBBox(event);
        if (bbox) {
          setCurrentBBox(bbox);
          loadLights(bbox);
        }
      }, 400);
    },
    [pickingLocation, loadLights],
  );

  const handleSinglePinTap = async (item: LightItem) => {
    setPreviewVisible(true);
    setPreviewData(null);
    setPreviewError(null);
    setPreviewLoading(true);
    try {
      const res = await getPassportDetail(item.passportId);
      const d = res.data.data;
      setPreviewData({
        passportId: d.passportId,
        spaceName: d.spaceName,
        address: d.address,
        visitedAt: d.visitedAt,
        imageUrl: d.imageUrls?.[0] ?? null,
        musicTitle: d.musicTitle ?? null,
        musicArtist: d.musicArtist ?? null,
      });
    } catch {
      setPreviewError("장소 정보를 불러오지 못했어요.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleServerClusterTap = (item: LightItem) => {
    const lat = item.centerLatitude ?? item.latitude;
    const lng = item.centerLongitude ?? item.longitude;
    mapRef.current?.animateCameraTo({
      latitude: lat,
      longitude: lng,
      zoom: 16,
      duration: 400,
    });
  };

  const handleFrontClusterTap = (cluster: FrontCluster) => {
    if (cluster.items.length === 1) {
      handleSinglePinTap(cluster.items[0]);
    } else {
      setActiveCluster(cluster);
    }
  };

  const handleSheetItemSelect = (item: LightItem) => {
    setActiveCluster(null);
    handleSinglePinTap(item);
  };

  const handleOpenDetail = async () => {
    if (!previewData) return;
    setDetailLoading(true);
    try {
      const res = await getPassportDetail(previewData.passportId);
      setDetailItem(res.data.data);
      setPreviewVisible(false);
      setPreviewData(null);
    } catch (e) {
      console.error("상세 조회 실패:", e);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRegisterPress = () => {
    setShowRegisterBtn(false);
    setPickingLocation(true);
    setPreviewVisible(false);
  };

  const handlePinLocation = async () => {
    const { latitude, longitude } = cameraCenter;
    setAddressLoading(true);
    try {
      const address = await naverReverseGeocode(latitude, longitude);
      setPickedLocation({ latitude, longitude, address });
    } finally {
      setAddressLoading(false);
      setShowLocationConfirm(true);
    }
  };

  const handleLocationConfirm = () => {
    setPickingLocation(false);
    setShowLocationConfirm(false);
    setShowAddPlace(true);
  };

  const handleLocationCancel = () => {
    setShowLocationConfirm(false);
    setPickedLocation(null);
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

  return (
    <View style={styles.container}>
      <NaverMapView
        ref={mapRef}
        style={styles.map}
        initialCamera={{ latitude: 37.5665, longitude: 126.978, zoom: 12 }}
        isNightModeEnabled={false}
        lightness={0}
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

        {lights
          .filter((it) => it.isCluster)
          .map((item, idx) => (
            <NaverMapMarkerOverlay
              key={`server-cluster-${idx}`}
              latitude={item.centerLatitude ?? item.latitude}
              longitude={item.centerLongitude ?? item.longitude}
              anchor={{ x: 0.5, y: 1 }}
              width={56}
              height={64}
              onTap={() => handleServerClusterTap(item)}
            >
              <ServerClusterMarker count={item.count ?? 0} />
            </NaverMapMarkerOverlay>
          ))}

        {frontClusters.map((cluster) =>
          cluster.items.length === 1 ? (
            <NaverMapMarkerOverlay
              key={cluster.id}
              latitude={cluster.centerLat}
              longitude={cluster.centerLng}
              anchor={{ x: 0.5, y: 1 }}
              width={130}
              height={58}
              onTap={() => handleFrontClusterTap(cluster)}
            >
              <PassportMarker spaceName={cluster.items[0].spaceName} />
            </NaverMapMarkerOverlay>
          ) : (
            <NaverMapMarkerOverlay
              key={cluster.id}
              latitude={cluster.centerLat}
              longitude={cluster.centerLng}
              anchor={{ x: 0.5, y: 1 }}
              width={64}
              height={72}
              onTap={() => handleFrontClusterTap(cluster)}
            >
              <FrontClusterMarker count={cluster.items.length} />
            </NaverMapMarkerOverlay>
          ),
        )}
      </NaverMapView>

      {pickingLocation && <CenterPin />}

      {!pickingLocation && (
        <View
          style={[styles.legendWrapper, { bottom: baseBottom + 64 }]}
          pointerEvents="none"
        >
          <ExplorationLegend />
        </View>
      )}

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

      {pickingLocation && !showLocationConfirm && (
        <>
          <View style={styles.pickingGuideWrapper}>
            <View style={styles.pickingGuideCard}>
              <Text style={styles.pickingGuideText}>
                지도를 움직여 핀을 원하는 위치에 맞추세요
              </Text>
            </View>
          </View>
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
              disabled={addressLoading}
            >
              {addressLoading ? (
                <ActivityIndicator color={GREEN_MID} />
              ) : (
                <Text style={styles.registerButtonText}>이 위치로 고정</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      {pickingLocation && showLocationConfirm && pickedLocation && (
        <View style={[styles.discoveryWrapper, { bottom: baseBottom + 60 }]}>
          <LocationConfirmCard
            latitude={pickedLocation.latitude}
            longitude={pickedLocation.longitude}
            address={pickedLocation.address}
            onConfirm={handleLocationConfirm}
            onCancel={handleLocationCancel}
          />
        </View>
      )}

      {previewVisible && !pickingLocation && (
        <View style={[styles.discoveryWrapper, { bottom: baseBottom + 60 }]}>
          <PassportPreviewCard
            preview={previewData}
            loading={previewLoading}
            error={previewError}
            onClose={() => {
              setPreviewVisible(false);
              setPreviewData(null);
            }}
            onOpenDetail={handleOpenDetail}
          />
        </View>
      )}

      {detailLoading && (
        <View style={styles.detailLoadingOverlay}>
          <ActivityIndicator size="large" color={GREEN_MID} />
        </View>
      )}

      {detailItem && (
        <View style={StyleSheet.absoluteFill}>
          <PassportDetail
            item={detailItem}
            editable={false}
            onBack={() => {
              setDetailItem(null);
              setPreviewVisible(true);
            }}
          />
        </View>
      )}

      {showAddPlace && (
        <View style={StyleSheet.absoluteFill}>
          <AddPlaceScreen
            initialLatitude={pickedLocation?.latitude}
            initialLongitude={pickedLocation?.longitude}
            initialAddress={pickedLocation?.address ?? undefined}
            onClose={() => {
              setShowAddPlace(false);
              setShowRegisterBtn(true);
              setPickingLocation(false);
              setPickedLocation(null);
              loadLights(INITIAL_BBOX);
            }}
          />
        </View>
      )}

      <ClusterBottomSheet
        cluster={activeCluster}
        onClose={() => setActiveCluster(null)}
        onSelectItem={handleSheetItemSelect}
      />
    </View>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  // 유저 위치 마커
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
    backgroundColor: "rgba(52, 211, 153, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(52, 211, 153, 0.5)",
  },
  userLocationInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: GREEN,
    borderWidth: 2,
    borderColor: "white",
    shadowColor: GREEN,
    shadowOpacity: 0.6,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },

  // 여권 마커 — 아이콘 분리 버블
  passportMarkerWrapper: { alignItems: "center" },
  passportMarkerBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GREEN_DARK,
    borderRadius: 22,
    paddingVertical: 4,
    paddingRight: 12,
    paddingLeft: 4,
    gap: 6,
    shadowColor: GREEN_DARK,
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    maxWidth: 150,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.18)",
  },
  passportMarkerIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GREEN,
    justifyContent: "center",
    alignItems: "center",
  },
  passportMarkerEmoji: { fontSize: 14 },
  passportMarkerLabel: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
    flexShrink: 1,
    letterSpacing: 0.2,
  },
  passportMarkerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: GREEN_DARK,
  },

  // 서버 클러스터 — 초록 계열
  clusterWrapper: { alignItems: "center" },
  clusterBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: GREEN_MID,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    borderWidth: 3,
    borderColor: "white",
  },
  clusterCount: { color: "white", fontSize: 15, fontWeight: "800" },
  clusterTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: GREEN_MID,
  },

  // 프론트 클러스터 — 초록 계열
  frontClusterWrapper: { alignItems: "center" },
  frontClusterOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(52, 211, 153, 0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  frontClusterInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GREEN_MID,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    borderWidth: 2.5,
    borderColor: "white",
  },
  frontClusterCount: { color: "white", fontSize: 16, fontWeight: "800" },
  frontClusterTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: GREEN_MID,
  },

  // 프리뷰 카드
  previewCard: {
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  previewCloseBtn: {
    position: "absolute",
    top: 12,
    right: 14,
    zIndex: 10,
    padding: 4,
  },
  previewCloseText: { fontSize: 16, color: "#94A3B8" },
  previewCenter: { paddingVertical: 32, alignItems: "center", gap: 8 },
  previewLoadingText: { fontSize: 13, color: "#94A3B8", marginTop: 6 },
  previewErrorText: { fontSize: 13, color: "#EF4444" },
  previewImage: { width: "100%", height: 160 },
  previewImagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImagePlaceholderText: { fontSize: 36 },
  previewBody: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 6,
  },
  previewPlaceName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  previewRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  previewRowIcon: { fontSize: 13 },
  previewRowText: { fontSize: 13, color: "#475569", flexShrink: 1 },
  previewDetailBtn: {
    marginTop: 12,
    backgroundColor: GREEN_MID,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  previewDetailBtnText: { color: "white", fontWeight: "700", fontSize: 14 },

  detailLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },

  // 핀
  centerPinWrapper: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -16,
    marginTop: -40,
    zIndex: 10,
  },
  centerPinEmoji: { fontSize: 36 },

  // 가이드
  pickingGuideWrapper: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    alignItems: "center",
    zIndex: 10,
  },
  pickingGuideCard: {
    backgroundColor: "rgba(6, 95, 70, 0.88)",
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

  // 범례
  legendWrapper: { position: "absolute", right: 16 },
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

  // 하단 바
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
  registerButtonText: { fontSize: 15, fontWeight: "700", color: "#1E293B" },

  // 디스커버리/위치확인 카드
  discoveryWrapper: { position: "absolute", left: 16, right: 16 },
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
  locationText: { fontSize: 13, color: "#64748B", textAlign: "center" },
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

  // 클러스터 바텀시트
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  sheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "65%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#BBF7D0",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0FDF4",
  },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  sheetCloseText: { fontSize: 16, color: "#94A3B8", padding: 4 },
  sheetScroll: { flexGrow: 0 },
  sheetScrollContent: { paddingBottom: 32, paddingTop: 4 },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
    gap: 14,
  },
  sheetItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(52, 211, 153, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  sheetItemEmoji: { fontSize: 20 },
  sheetItemBody: { flex: 1 },
  sheetItemName: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  sheetItemSub: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  sheetItemChevron: { fontSize: 20, color: "#BBF7D0", fontWeight: "300" },
});
