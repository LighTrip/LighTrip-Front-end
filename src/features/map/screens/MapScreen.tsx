import CurrentLocationIcon from "@/assets/icons/current-location.svg";
import { ClusterDetailItem, getClusterDetail } from "@/src/api/lights.api";
import { getPassportDetail } from "@/src/api/passport/passport.api";
import { getTeamMembers } from "@/src/api/teamApi";
import { useTeamMode } from "@/src/components/common/TeamModeContext";
import type { TeamMember } from "@/src/features/team/types/team.types";
import PassportDetail from "@/src/features/passport/screens/PassportDetail";
import AddPlaceScreen from "@/src/features/place/screens/AddPlaceScreen";
import {
  NaverMapMarkerOverlay,
  NaverMapView,
} from "@mj-studio/react-native-naver-map";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  LogBox,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CenterPin } from "../components/CenterPin";
import { ClusterBottomSheet } from "../components/ClusterBottomSheet";
import { DiscoverBanner } from "../components/DiscoverBanner";
import { LocationConfirmCard } from "../components/LocationConfirmCard";
import { PassportPreviewCard } from "../components/PassportPreviewCard";
import {
  FrontClusterMarker,
  PassportMarker,
  ServerClusterMarker,
  UserLocationMarker,
} from "../components/markers/MapMarkers";
import {
  GREEN,
  GREEN_MID,
  INITIAL_BBOX
} from "../constants/mapConstants";
import { useMapLights } from "../hooks/useMapLights";
import { subscribeMapTabPress } from "../mapTabBus";
import {
  FrontCluster,
  PassportPreview,
  PickedLocation,
} from "../types/map.types";
import {
  clusterSingleMarkers,
  dominantCategory,
  naverReverseGeocode,
} from "../utils/mapUtils";

LogBox.ignoreLogs([
  'Unsupported top level event type "topSvgLayout" dispatched',
]);

export default function MapScreen() {
  const { bottom: safeBottom, top: safeTop } = useSafeAreaInsets();
  const { lights, currentBBox, loadLights, handleCameraChanged } =
    useMapLights();
  const { isTeamMode, teamId, currentUserId, teamLiveLocations } = useTeamMode();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const [showRegisterBtn, setShowRegisterBtn] = useState(true);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

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

  const [activeClusterItems, setActiveClusterItems] = useState<
    ClusterDetailItem[] | null
  >(null);
  const [discoverBanner, setDiscoverBanner] = useState<{
    address: string | null;
  } | null>(null);

  const mapRef = useRef<any>(null);
  // 사용자가 이미 지도를 움직였다면 위치가 늦게 도착해도 화면을 뺏지 않는다.
  const userMovedCameraRef = useRef(false);
  const baseBottom = 68 + Math.max(safeBottom, 12) - 8;
  const frontClusters = clusterSingleMarkers(lights, currentBBox);

  // 팀 모드로 전환했을 때만 팀원 실시간 위치를 메인 지도에 표시한다.
  // 내 위치는 기존 초록색 원형 마커(UserLocationMarker)로 표시되므로 여기서는 제외한다.
  const visibleTeamLocations = isTeamMode
    ? teamLiveLocations.filter((location) => location.userId !== currentUserId)
    : [];
  const getTeamMemberProfileImg = (userId: number) =>
    teamMembers.find((member) => member.userId === userId)?.profileImg;
  const myProfileImg =
    currentUserId !== null ? getTeamMemberProfileImg(currentUserId) : undefined;

  useEffect(() => {
    if (!isTeamMode || !teamId) {
      setTeamMembers([]);
      return;
    }

    let isMounted = true;

    getTeamMembers(Number(teamId))
      .then((members) => {
        if (isMounted) setTeamMembers(members);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isTeamMode, teamId]);

  useEffect(() => {
    // 기본값(서울시청)에 머물지 않고 현재 위치에서 지도가 시작되게 한다.
    const showPosition = async (coords: {
      latitude: number;
      longitude: number;
    }) => {
      const { latitude, longitude } = coords;
      setUserLocation({ latitude, longitude });

      if (!userMovedCameraRef.current) {
        mapRef.current?.animateCameraTo({
          latitude,
          longitude,
          zoom: 16,
          duration: 500,
        });
      }

      setDiscoverBanner({ address: null });
      const address = await naverReverseGeocode(latitude, longitude);
      setDiscoverBanner({ address });
    };

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        // GPS 콜드 스타트는 수십 초가 걸리기도 하고, 에뮬레이터에선 아예 응답이 없다.
        // 마지막으로 알려진 위치가 있으면 그걸로 먼저 옮겨 두고, 정확한 좌표가 오면 보정한다.
        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown) {
          await showPosition(lastKnown.coords);
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        await showPosition(current.coords);
      } catch {
        // 위치를 아예 쓸 수 없는 환경에서는 기본 카메라 위치를 유지한다.
      }
    })();
  }, []);

  const onCameraChanged = useCallback(
    (event: any) => {
      // 사용자가 직접 지도를 움직였는지 기록해 둔다 (프로그램 이동과 구분).
      if (event?.reason === "Gesture") {
        userMovedCameraRef.current = true;
      }

      const result = handleCameraChanged(event, pickingLocation);
      if (result?.latitude && result?.longitude) {
        setCameraCenter({
          latitude: result.latitude,
          longitude: result.longitude,
        });
      }
    },
    [handleCameraChanged, pickingLocation],
  );

  const handleSinglePinTap = async (item: any) => {
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
        category: d.category ?? "ETC",
      });
    } catch {
      setPreviewError("장소 정보를 불러오지 못했어요.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleServerClusterTap = async (item: any) => {
    const lat = item.centerLatitude ?? item.latitude;
    const lng = item.centerLongitude ?? item.longitude;
    const expectedCount = item.count ?? 0;
    const viewLatSpan = currentBBox
      ? currentBBox.maxLat - currentBBox.minLat
      : 0.1;
    const viewLngSpan = currentBBox
      ? currentBBox.maxLng - currentBBox.minLng
      : 0.1;

    try {
      let content: ClusterDetailItem[] = [];
      let divisor = 10;
      for (let attempt = 0; attempt < 6; attempt++) {
        const halfLat = viewLatSpan / divisor / 2;
        const halfLng = viewLngSpan / divisor / 2;
        const res = await getClusterDetail({
          minLat: lat - halfLat,
          maxLat: lat + halfLat,
          minLng: lng - halfLng,
          maxLng: lng + halfLng,
          size: 50,
        });
        content = res.data.data?.content ?? [];
        if (content.length <= expectedCount) break;
        divisor *= 2;
      }
      if (content.length === 1) {
        handleSinglePinTap({
          ...content[0],
          latitude: lat,
          longitude: lng,
          isCluster: false,
        });
      } else if (content.length > 1) {
        setActiveClusterItems(content);
      } else {
        mapRef.current?.animateCameraTo({
          latitude: lat,
          longitude: lng,
          zoom: 16,
          duration: 400,
        });
      }
    } catch {
      mapRef.current?.animateCameraTo({
        latitude: lat,
        longitude: lng,
        zoom: 16,
        duration: 400,
      });
    }
  };

  const handleFrontClusterTap = async (cluster: FrontCluster) => {
    if (cluster.items.length === 1) {
      handleSinglePinTap(cluster.items[0]);
      return;
    }
    const lats = cluster.items.map((it) => it.latitude);
    const lngs = cluster.items.map((it) => it.longitude);
    const pad = 0.0001;
    try {
      const res = await getClusterDetail({
        minLat: Math.min(...lats) - pad,
        maxLat: Math.max(...lats) + pad,
        minLng: Math.min(...lngs) - pad,
        maxLng: Math.max(...lngs) + pad,
        size: 50,
      });
      const content: ClusterDetailItem[] = res.data.data?.content ?? [];
      if (content.length > 0) setActiveClusterItems(content);
    } catch {
      setActiveClusterItems(
        cluster.items.map((it) => ({
          passportId: it.passportId,
          thumbnailUrl: it.thumbnailUrl,
          spaceName: it.spaceName,
          districtCategory: it.districtCategory,
          districtDisplayName: it.districtCategory,
          category: it.category,
          categoryDisplayName: it.category,
          visitedAt: it.visitedAt,
          visibility: "PUBLIC",
          likeCount: it.likeCount,
          scrapCount: it.scrapCount,
        })),
      );
    }
  };

  const handleSheetItemSelect = (item: ClusterDetailItem) => {
    setActiveClusterItems(null);
    handleSinglePinTap({
      ...item,
      latitude: 0,
      longitude: 0,
      isCluster: false,
    });
  };

  const handleOpenDetail = async () => {
    if (!previewData) return;
    setDetailLoading(true);
    try {
      const res = await getPassportDetail(previewData.passportId);
      setDetailItem(res.data.data);
      // previewData 를 비우면 상세에서 뒤로 왔을 때 내용 없는 빈 카드가 뜬다.
      // 감추는 건 previewVisible 로만 처리한다.
      setPreviewVisible(false);
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
    try {
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
    } catch {
      alert("현재 위치를 가져올 수 없습니다.");
    }
  };

  // 지도 탭을 다시 누르면 열려 있던 오버레이/모드를 닫고, 새로고침하며 지도 탭 메인으로 복귀
  useEffect(() => {
    return subscribeMapTabPress(() => {
      setShowAddPlace(false);
      setPreviewVisible(false);
      setPreviewData(null);
      setPreviewLoading(false);
      setPreviewError(null);
      setDetailItem(null);
      setDetailLoading(false);
      setPickingLocation(false);
      setShowLocationConfirm(false);
      setPickedLocation(null);
      setAddressLoading(false);
      setActiveClusterItems(null);
      setShowRegisterBtn(true);
      userMovedCameraRef.current = false;
      handleLocationPress();
      loadLights(INITIAL_BBOX);
    });
  }, [loadLights]);

  return (
    <View style={styles.container}>
      <NaverMapView
        ref={mapRef}
        style={styles.map}
        initialCamera={{ latitude: 37.5665, longitude: 126.978, zoom: 12 }}
        isNightModeEnabled={true}
        lightness={0}
        isShowZoomControls={false}
        onCameraChanged={onCameraChanged}
      >
        {userLocation && (
          <NaverMapMarkerOverlay
            latitude={userLocation.latitude}
            longitude={userLocation.longitude}
            anchor={{ x: 0.5, y: 0.5 }}
            width={40}
            height={40}
          >
            <View style={styles.userLocationMarkerWrapper}>
              <UserLocationMarker />
              {isTeamMode && myProfileImg && (
                <Image
                  source={{ uri: myProfileImg }}
                  style={styles.userLocationProfileImage}
                />
              )}
            </View>
          </NaverMapMarkerOverlay>
        )}

        {lights
          .filter((it) => it.isCluster)
          .map((item, idx) => (
            <NaverMapMarkerOverlay
              key={`server-cluster-${idx}-${item.count ?? 0}`}
              latitude={item.centerLatitude ?? item.latitude}
              longitude={item.centerLongitude ?? item.longitude}
              anchor={{ x: 0.5, y: 0.5 }}
              width={56}
              height={56}
              onTap={() => handleServerClusterTap(item)}
            >
              <ServerClusterMarker
                count={item.count ?? 0}
                category={item.category}
              />
            </NaverMapMarkerOverlay>
          ))}

        {frontClusters.map((cluster) =>
          cluster.items.length === 1 ? (
            <NaverMapMarkerOverlay
              key={`single-${cluster.items[0].passportId}`}
              latitude={cluster.centerLat}
              longitude={cluster.centerLng}
              anchor={{ x: 0.5, y: 0.5 }}
              width={56}
              height={56}
              onTap={() => handleFrontClusterTap(cluster)}
            >
              <PassportMarker
                spaceName={cluster.items[0].spaceName}
                category={cluster.items[0].category}
              />
            </NaverMapMarkerOverlay>
          ) : (
            <NaverMapMarkerOverlay
              key={`fc-${cluster.id}-${cluster.items.length}`}
              latitude={cluster.centerLat}
              longitude={cluster.centerLng}
              anchor={{ x: 0.5, y: 0.5 }}
              width={64}
              height={64}
              onTap={() => handleFrontClusterTap(cluster)}
            >
              <FrontClusterMarker
                count={cluster.items.length}
                category={dominantCategory(cluster.items)}
              />
            </NaverMapMarkerOverlay>
          ),
        )}

        {visibleTeamLocations.map((location) => (
          <NaverMapMarkerOverlay
            key={`team-live-${location.userId}`}
            latitude={location.latitude}
            longitude={location.longitude}
            anchor={{ x: 0.5, y: 0.5 }}
            width={46}
            height={46}
          >
            <View style={styles.teamLiveMarker}>
              {getTeamMemberProfileImg(location.userId) ? (
                <Image
                  source={{ uri: getTeamMemberProfileImg(location.userId) ?? "" }}
                  style={styles.teamLiveMarkerImage}
                />
              ) : (
                <View style={styles.teamLiveMarkerAvatar}>
                  <Text style={styles.teamLiveMarkerInitial}>
                    {location.nickname.charAt(0)}
                  </Text>
                </View>
              )}
            </View>
          </NaverMapMarkerOverlay>
        ))}
      </NaverMapView>

      {pickingLocation && <CenterPin />}

      {!pickingLocation && (
        <View style={[styles.bottomBar, { bottom: baseBottom }]}>
          <TouchableOpacity
            style={styles.locationButton}
            activeOpacity={0.8}
            onPress={handleLocationPress}
          >
            <CurrentLocationIcon width={26} height={26} stroke="#000000" />
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
          <View style={[styles.pickingGuideWrapper, { top: safeTop + 10 }]}>
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
              <CurrentLocationIcon width={26} height={26} stroke="#000000" />
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
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.85}
              onPress={() => {
                setPickingLocation(false);
                setShowRegisterBtn(true);
              }}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {discoverBanner && !pickingLocation && !previewVisible && (
        <View style={[styles.discoveryWrapper, { bottom: baseBottom }]}>
          <DiscoverBanner
            address={discoverBanner.address}
            onDismiss={() => setDiscoverBanner(null)}
            onRegister={() => {
              setDiscoverBanner(null);
              setShowAddPlace(true);
            }}
          />
        </View>
      )}

      {pickingLocation && showLocationConfirm && pickedLocation && (
        <View style={[styles.discoveryWrapper, { bottom: baseBottom }]}>
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
        items={activeClusterItems}
        onClose={() => setActiveClusterItems(null)}
        onSelectItem={handleSheetItemSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  detailLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  pickingGuideWrapper: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    alignItems: "center",
    zIndex: 10,
  },
  pickingGuideCard: {
    backgroundColor: "rgba(16, 185, 129, 0.88)",
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
  cancelButton: {
    flex: 0.5,
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
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#EF4444",
  },
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
  userLocationMarkerWrapper: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  userLocationProfileImage: {
    position: "absolute",
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    borderColor: GREEN,
  },
  teamLiveMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  teamLiveMarkerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE06E",
  },
  teamLiveMarkerImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    backgroundColor: "#E5ECFC",
  },
  teamLiveMarkerInitial: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "800",
  },
});
